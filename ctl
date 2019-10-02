#!/bin/sh
# Control battery usage, wired and wireless network and Bluetooth earphones.
# 0BSD 2019 Denys Nykula <nykula@ukr.net>
# ctl bat|net|ear
tip() { echo "===> [Tip] $@"; }
wait() { for i in {1..4}; do echo -n .; sleep 1; done; }
if test "$1" = bat; then cd /sys/*/cpu/devices; for i in *; do
  if test `cat $i/*/c*max*` = `cat $i/*/s*max*`; then cat $i/*/c*min*
  else cat $i/*/c*max*; fi >`ls $i/*/s*max*`; done
  watch cat */*/s*cur* /proc/loadavg /sys/class/power_supply/*/charge_now
elif test "$1" = disco; then rfkill block wlan
  ifconfig enp3s0 down; kill `pgrep dhcp` `pgrep wpa_supplicant`
elif test "$1" = net; then ctl disco; ifconfig enp3s0 up
  rfkill unblock wlan; wpa_supplicant -B -iwlp2s0 -c/etc/wpa_supplicant.conf
  (sleep 8; wpa_cli scan)&
  if busybox udhcpc -fnqienp3s0; then rfkill block wlan; pkill wpa_supplicant
  tip Ctrl+D to off; cat; ctl disco; exit; fi; ifconfig enp3s0 down
  wpa_cli scan_results; if ! wpa_cli status |grep -q wpa_state=COMPLETED; then
    tip ctl wpa YOUR_NET [or] ctl ess NO_PASS [then] Ctrl+D; sh; fi
  pkill -HUP wpa_supplicant; busybox udhcpc -fnqiwlp2s0; echo `wpa_cli status`
  tip Ctrl+D to off; wpa_cli; ctl disco
elif test "$1" = pair; then echo paired-devices |bluetoothctl |
  awk '/^Device/{print$2}'
elif test "$1" = btoff; then pgrep bluetoothd &&echo power off |bluetoothctl
  rfkill block bluetooth; killall bluetoothd bluealsa{,-aplay} dbus-daemon
  rm -r /etc/asound.conf /run/dbus*
elif test "$1" = ear; then ctl btoff; mkdir /run/dbus
  dbus-daemon --system; rfkill unblock bluetooth; wait
  /usr/libexec/*/bluetoothd -n &wait
  echo -e 'power on\nscan on' |bluetoothctl; bluealsa &wait
  tip pair, connect, Ctrl+D; bluetoothctl
  bluealsa-aplay `ctl pair` &tee /etc/asound.conf <<EOF
defaults.bluealsa { device "`ctl pair`" }
pcm.!default { type plug slave { pcm "bluealsa" } }
ctl.!default { type bluealsa }
EOF
  tip Ctrl+D to off; bluetoothctl; ctl btoff
elif test "$1" = vol; then amixer sget Master |
  awk '/Limits/{printf$5"*0."}/([0-9]+%)/{gsub(/[[\]%]/,"");print$4}' |bc
elif test "$1" = dentry; then
  printf '[Desktop Entry]\nExec=%s\nName=%s\nType=Application\nVersion=1.0\n' "$2" "$3"
elif test "$1" = ess; then >>/etc/wpa_supplicant.conf printf \
  'network={\nssid="%s"\nkey_mgmt=NONE\n}\n' "$2"
elif test "$1" = wpa; then >>/etc/wpa_supplicant.conf wpa_passphrase "$2"
elif test "$1" = png; then x=`mktemp`; cat >$x; convert -size 640x400 \
  xc:white -font /usr/share/fonts/liberation/LiberationSerif-Regular.ttf \
  -pointsize 14 -annotate +8+18 \
  @$x png:- |mpv -loop -pause -; rm $x
elif test "$1" = eml; then perl -pe 'use MIME::QuotedPrint;$_=decode_qp($_)'
else sed '/^# ctl/!d;s/# /usage: /' $0; sed '2!d;s/# /\n/' $0; fi
