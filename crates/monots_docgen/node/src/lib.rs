use std::path::Path;

use napi::{bindgen_prelude::AsyncTask, Env, JsUndefined, Result, Task};
use napi_derive::napi;

pub struct Extract {
  from: String,
  to: String,
}

#[napi]
impl Task for Extract {
  type JsValue = JsUndefined;
  type Output = ();

  fn compute(&mut self) -> Result<Self::Output> {
    monots_docgen::extract(Path::new(self.from.as_str()), Path::new(self.to.as_str())).unwrap();
    Ok(())
  }

  fn resolve(&mut self, env: Env, _: ()) -> Result<Self::JsValue> {
    env.get_undefined()
  }
}

#[napi]
pub fn extract(from: String, to: String) -> AsyncTask<Extract> {
  AsyncTask::new(Extract { from, to })
}
