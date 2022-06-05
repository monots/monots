use std::{fs::File, path::Path};

use anyhow::{bail, Error};
use flate2::read::GzDecoder;
use tar::Archive;
use zip::ZipArchive;

/// Extract the binary from the tarball.
pub fn extract(from: &Path, to: &Path) -> Result<(), Error> {
  let file = File::open(from)?;

  if let Some(extension) = from.extension() {
    if extension == "zip" {
      let mut archive = ZipArchive::new(file)?;
      archive.extract(to)?;
      return Ok(());
    }

    if (extension == "gz") || (extension == "tgz") || (extension == "tar") {
      let mut archive = Archive::new(GzDecoder::new(file));
      archive.unpack(to)?;
      return Ok(());
    }

    bail!("Unsupported file type: {}", extension.to_string_lossy());

    // let mut archive = Archive::new(GzDecoder::new(file));

    // for mut entry in archive.entries()?.filter_map(|e| e.ok()) {
    //   let mut path = to.to_path_buf();

    //   if let Some(file_name) = entry.path()?.file_name() {
    //     path.push(file_name);
    //   }

    //   entry.unpack(&path)?;
    // }

    // return Ok(());
  }

  bail!(
    "No extension for the given path: {}",
    from.as_os_str().to_string_lossy()
  );
}
