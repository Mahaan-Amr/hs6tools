#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"
load_recovery_config

require_passphrase_file
require_nonempty WAL_ARCHIVE_DIR
[ "$#" -eq 2 ] || recovery_die "usage: archive-wal.sh SOURCE_PATH WAL_FILENAME"

source_path="$1"
wal_filename="$2"
[[ "$wal_filename" =~ ^[A-F0-9]{24}([.][A-F0-9]{8})?$ ]] || recovery_die "invalid WAL filename"
[ -f "$source_path" ] || recovery_die "WAL source file is missing"

require_command gpg
require_command sha256sum
mkdir -p "$WAL_ARCHIVE_DIR"

destination="${WAL_ARCHIVE_DIR}/${wal_filename}.gpg"
checksum="${destination}.sha256"
if [ -f "$destination" ] && [ -f "$checksum" ]; then
  (cd "$WAL_ARCHIVE_DIR" && sha256sum --check --status "$(basename "$checksum")")
  exit 0
fi

partial="${destination}.partial.$$"
trap 'rm -f -- "$partial"' EXIT
gpg --batch --yes --quiet --symmetric --cipher-algo AES256 \
  --passphrase-file "$BACKUP_PASSPHRASE_FILE" --output "$partial" "$source_path"
mv "$partial" "$destination"
(
  cd "$WAL_ARCHIVE_DIR" || recovery_die "cannot enter WAL archive directory"
  sha256sum "$(basename "$destination")" > "$(basename "$checksum")"
  sha256sum --check --status "$(basename "$checksum")"
)
recovery_log "wal_archived name=${wal_filename}"
