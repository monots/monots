use std::{
  fmt,
  io::Write,
  sync::atomic::{AtomicBool, Ordering},
};

use lazy_static::lazy_static;
use termcolor::{
  Ansi,
  Color::{Ansi256, Blue, Green, Magenta, Red},
  ColorSpec,
  WriteColor,
};

lazy_static! {
  static ref USE_COLOR: AtomicBool = AtomicBool::new(false);
}

#[cfg(feature = "rust")]
pub fn enable_color() {
  USE_COLOR.store(true, Ordering::Relaxed);
}

#[cfg(feature = "rust")]
pub fn disable_color() {
  USE_COLOR.store(false, Ordering::Relaxed);
}

pub fn use_color() -> bool {
  USE_COLOR.load(Ordering::Relaxed)
}

fn style<S: AsRef<str>>(s: S, colorspec: ColorSpec) -> impl fmt::Display {
  if !use_color() {
    return String::from(s.as_ref());
  }
  let mut v = Vec::new();
  let mut ansi_writer = Ansi::new(&mut v);
  ansi_writer.set_color(&colorspec).unwrap();
  ansi_writer.write_all(s.as_ref().as_bytes()).unwrap();
  ansi_writer.reset().unwrap();
  String::from_utf8_lossy(&v).into_owned()
}

pub fn yellow<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Ansi256(11)));
  style(s, style_spec)
}

pub fn cyan<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Ansi256(14)));
  style(s, style_spec)
}

pub fn red<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Red));
  style(s, style_spec)
}

pub fn green<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Green)).set_intense(true);
  style(s, style_spec)
}

pub fn magenta<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Magenta));
  style(s, style_spec)
}

pub fn bold<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_bold(true);
  style(s, style_spec)
}

#[cfg(feature = "rust")]
pub fn gray<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Ansi256(8)));
  style(s, style_spec)
}

#[cfg(feature = "rust")]
pub fn italic_gray<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Ansi256(8))).set_italic(true);
  style(s, style_spec)
}

#[cfg(feature = "rust")]
pub fn italic_cyan<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Ansi256(14))).set_italic(true);
  style(s, style_spec)
}

pub fn intense_blue<S: AsRef<str>>(s: S) -> impl fmt::Display {
  let mut style_spec = ColorSpec::new();
  style_spec.set_fg(Some(Blue)).set_intense(true);
  style(s, style_spec)
}
