#!/bin/sh
# Control battery, network and CPU frequency.
# 0BSD 2019 Denys Nykula <nykula@ukr.net>
# ctl bat|wl|recon|airpl|cool|turbo|ear
if test "$1" = bat; then watch cat /sys/class/power_supply/*/charge_now
elif test "$1" = btoff; then pgrep bluetoothd &&echo power off |bluetoothctl
  killall bluetoothd bluealsa{,-aplay} dbus-daemon
  rm -r /etc/asound.conf /run/dbus*
elif test "$1" = wl; then ctl btoff; mkdir /run/dbus
  dbus-daemon --system &rfkill unblock all; wpa_cli scan; echo -n ...; sleep 4
  /usr/libexec/*/bluetoothd -n &wpa_cli status; echo -n ...; sleep 4
  wpa_cli scan_results; bluetoothctl
elif test "$1" = recon; then ifconfig enp3s0 down; pkill -HUP wpa_supplicant
  busybox udhcpc -fnqiwlp2s0 &&exit
  ifconfig enp3s0 up; busybox udhcpc -fnqienp3s0
elif test "$1" = airpl; then
  ctl btoff; ifconfig enp3s0 down; rfkill block all; kill `pgrep dhcp`
  watch wpa_cli status
elif test "$1" = cool; then cd /sys/*/cpu/devices
  for i in *; do cat $i/*/c*min* >$i/*/s*max*; done; watch cat */*/s*cur*
elif test "$1" = turbo; then cd /sys/*/cpu/devices
  for i in *; do cat $i/*/c*max* >$i/*/s*max*; done; watch cat */*/s*cur*
elif test "$1" = pair; then echo paired-devices |bluetoothctl |
  awk '/^Device/{print$2}'
elif test "$1" = ear; then bluealsa &sleep 4
  bluealsa-aplay `ctl pair` &tee /etc/asound.conf <<EOF
defaults.bluealsa { device "`ctl pair`" }
pcm.!default { type plug slave { pcm "bluealsa" } }
ctl.!default { type bluealsa }
EOF
  bluetoothctl; ctl btoff
else sed '/^# ctl/!d;s/# /usage: /' $0; sed '2!d;s/# /\n/' $0; fi
