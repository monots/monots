/* Taken from `fast-sort` to support es modules */

type IOrder = 1 | -1;

export type IComparer = (a: any, z: any, order: IOrder) => number;

export interface ISortInstanceOptions {
  comparer?: IComparer;
  inPlaceSorting?: boolean;
}

export type ISortByFunction<T> = (prop: T) => any;

export type ISortBy<T> = keyof T | ISortByFunction<T> | Array<keyof T | ISortByFunction<T>>;

export interface ISortByAscSorter<T> extends ISortInstanceOptions {
  asc: boolean | ISortBy<T>;
}

export interface ISortByDescSorter<T> extends ISortInstanceOptions {
  desc: boolean | ISortBy<T>;
}

export type ISortByObjectSorter<T> = ISortByAscSorter<T> | ISortByDescSorter<T>;

type IAnySortBy<T = any> =
  | ISortBy<T>
  | Array<ISortBy<T>>
  | ISortByObjectSorter<T>
  | Array<ISortByObjectSorter<T>>
  | boolean;

// >>> HELPERS <<<

const castComparer =
  (comparer: IComparer = defaultComparer) =>
  (a: any, z: any, order: IOrder) =>
    comparer(a, z, order) * order;

const throwInvalidConfigErrorIfTrue = function (condition: boolean, context: string) {
  if (condition) {
    throw new Error(`Invalid sort config: ${context}`);
  }
};

const unpackObjectSorter = function (sortByObj: ISortByObjectSorter<any>) {
  const { asc, desc } = (sortByObj as any) || {};
  const order = asc ? 1 : (-1 as IOrder);
  const sortBy = (asc || desc) as boolean | ISortBy<any>;

  // Validate object config
  throwInvalidConfigErrorIfTrue(!sortBy, 'Expected `asc` or `desc` property');
  throwInvalidConfigErrorIfTrue(
    asc && desc,
    'Ambiguous object with `asc` and `desc` config properties',
  );

  const comparer = sortByObj.comparer && castComparer(sortByObj.comparer);

  return { order, sortBy, comparer };
};

// >>> SORTERS <<<

const multiPropertySorterProvider = function (defaultComparer: IComparer) {
  return function multiPropertySorter(
    sortBy: IAnySortBy | undefined,
    sortByArray: Array<ISortBy<any>> | Array<ISortByObjectSorter<any>>,
    depth: number,
    order: IOrder,
    comparer: IComparer,
    a: any,
    z: any,
  ): number {
    let valA;
    let valB;

    if (typeof sortBy === 'string') {
      valA = a[sortBy];
      valB = z[sortBy];
    } else if (typeof sortBy === 'function') {
      valA = sortBy(a);
      valB = sortBy(z);
    } else {
      const objectSorterConfig = unpackObjectSorter(sortBy as ISortByObjectSorter<any>);
      return multiPropertySorter(
        objectSorterConfig.sortBy,
        sortByArray,
        depth,
        objectSorterConfig.order,
        objectSorterConfig.comparer || defaultComparer,
        a,
        z,
      );
    }

    const equality = comparer(valA, valB, order);

    if ((equality === 0 || (valA == null && valB == null)) && sortByArray.length > depth) {
      return multiPropertySorter(sortByArray[depth], sortByArray, depth + 1, order, comparer, a, z);
    }

    return equality;
  };
};

function getSortStrategy(
  sortBy: IAnySortBy | undefined,
  comparer: IComparer = defaultComparer,
  order: IOrder,
): (a: any, z: any) => number {
  // Flat array sorter
  if (sortBy === undefined || sortBy === true) {
    return (a, b) => comparer(a, b, order);
  }

  // Sort list of objects by single object key
  if (typeof sortBy === 'string') {
    throwInvalidConfigErrorIfTrue(
      sortBy.includes('.'),
      'String syntax not allowed for nested properties.',
    );
    return (a, b) => comparer(a[sortBy], b[sortBy], order);
  }

  // Sort list of objects by single function sorter
  if (typeof sortBy === 'function') {
    return (a, b) => comparer(sortBy(a), sortBy(b), order);
  }

  // Sort by multiple properties
  if (Array.isArray(sortBy)) {
    const multiPropSorter = multiPropertySorterProvider(comparer);
    return (a, b) => multiPropSorter(sortBy[0], sortBy, 1, order, comparer, a, b);
  }

  // Unpack object config to get actual sorter strategy
  const objectSorterConfig = unpackObjectSorter(sortBy as ISortByObjectSorter<any>);
  return getSortStrategy(
    objectSorterConfig.sortBy,
    objectSorterConfig.comparer || comparer,
    objectSorterConfig.order,
  );
}

const sortArray = function (order: IOrder, ctx: any[], sortBy?: IAnySortBy, comparer?: IComparer) {
  if (!Array.isArray(ctx)) {
    return ctx;
  }

  // Unwrap sortBy if array with only 1 value to get faster sort strategy
  if (Array.isArray(sortBy) && sortBy.length < 2) {
    [sortBy] = sortBy;
  }

  return ctx.sort(getSortStrategy(sortBy, comparer, order));
};

// >>> Public <<<

interface IFastSort<T> {
  /**
   * Sort array in ascending order.
   * @example
   * sort([3, 1, 4]).asc();
   * sort(users).asc(u => u.firstName);
   * sort(users).asc([
   *   u => u.firstName,
   *   u => u.lastName,
   * ]);
   */
  asc: (sortBy?: ISortBy<T> | Array<ISortBy<T>>) => T[];
  /**
   * Sort array in descending order.
   * @example
   * sort([3, 1, 4]).desc();
   * sort(users).desc(u => u.firstName);
   * sort(users).desc([
   *   u => u.firstName,
   *   u => u.lastName,
   * ]);
   */
  desc: (sortBy?: ISortBy<T> | Array<ISortBy<T>>) => T[];
  /**
   * Sort array in ascending or descending order. It allows sorting on multiple props
   * in different order for each of them.
   * @example
   * sort(users).by([
   *  { asc: u => u.score },
   *  { desc: u => u.age },
   * ]);
   */
  by: (sortBy: ISortByObjectSorter<T> | Array<ISortByObjectSorter<T>>) => T[];
}

export function createNewSortInstance(
  opts: ISortInstanceOptions & { inPlaceSorting?: false },
): <T>(_ctx: readonly T[]) => IFastSort<T>;
export function createNewSortInstance(opts: ISortInstanceOptions): <T>(_ctx: T[]) => IFastSort<T>;
export function createNewSortInstance(opts: ISortInstanceOptions): <T>(_ctx: T[]) => IFastSort<T> {
  const comparer = castComparer(opts.comparer);

  return function <T>(_ctx: T[]): IFastSort<T> {
    const ctx = Array.isArray(_ctx) && !opts.inPlaceSorting ? [..._ctx] : _ctx;

    return {
      asc(sortBy?: ISortBy<T> | Array<ISortBy<T>>): T[] {
        return sortArray(1, ctx, sortBy, comparer);
      },
      desc(sortBy?: ISortBy<T> | Array<ISortBy<T>>): T[] {
        return sortArray(-1, ctx, sortBy, comparer);
      },
      by(sortBy: ISortByObjectSorter<T> | Array<ISortByObjectSorter<T>>): T[] {
        return sortArray(1, ctx, sortBy, comparer);
      },
    };
  };
}

const defaultComparer = (a: any, z: any, order: IOrder): number => {
  if (a == null) {
    return order;
  }

  if (z == null) {
    return -order;
  }

  if (a < z) {
    return -1;
  }

  if (a > z) {
    return 1;
  }

  return 0;
};

export const sort = createNewSortInstance({
  comparer: defaultComparer,
});

export const inPlaceSort = createNewSortInstance({
  comparer: defaultComparer,
  inPlaceSorting: true,
});
