import { parseFilePath } from '../helpers';

test('parseFilePath', () => {
  expect(parseFilePath('path').isPackage).toBe(true);
  expect(parseFilePath('/path').isPackage).toBe(false);

  expect(
    parseFilePath('C:\\Documents\\Newsletters\\Summer2018.pdf', { windows: true }).isPackage,
  ).toBe(false);
});
