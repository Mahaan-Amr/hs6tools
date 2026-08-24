#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"
load_recovery_config

require_passphrase_file
require_nonempty WAL_ARCHIVE_DIR
[ "$#" -eq 2 ] || recovery_die "usage: restore-wal.sh WAL_FILENAME DESTINATION_PATH"

wal_filename="$1"
destination_path="$2"
[[ "$wal_filename" =~ ^[A-F0-9]{24}([.][A-F0-9]{8})?$ ]] || recovery_die "invalid WAL filename"
encrypted_archive="${WAL_ARCHIVE_DIR}/${wal_filename}.gpg"
checksum_file="${encrypted_archive}.sha256"
[ -f "$encrypted_archive" ] || exit 1
[ -f "$checksum_file" ] || recovery_die "WAL checksum is missing"
require_command sha256sum
require_command gpg

(
  cd "$WAL_ARCHIVE_DIR" || recovery_die "cannot enter WAL archive directory"
  sha256sum --check --status "$(basename "$checksum_file")"
)
partial="${destination_path}.partial.$$"
trap 'rm -f -- "$partial"' EXIT
gpg --batch --quiet --decrypt --passphrase-file "$BACKUP_PASSPHRASE_FILE" \
  --output "$partial" "$encrypted_archive"
mv "$partial" "$destination_path"
