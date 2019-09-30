#!/bin/sh
# Control battery, network and CPU frequency.
# 0BSD 2019 Denys Nykula <nykula@ukr.net>
# ctl bat|wl|recon|airpl|cool|turbo
if test "$1" = bat; then watch cat /sys/class/power_supply/*/charge_now
elif test "$1" = wl; then
  kill `pgrep bluetooth` `pgrep dbus`; rm /run/dbus.pid; mkdir /run/dbus
  dbus-daemon --system &rfkill unblock all; wpa_cli scan; echo -n ...; sleep 4
  /usr/libexec/*/bluetoothd &wpa_cli status; echo -n ...; sleep 4
  wpa_cli scan_results; dbus-launch bluetoothctl
  kill `pgrep bluetooth` `pgrep dbus`; rm /run/dbus.pid
elif test "$1" = recon; then pkill -HUP wpa_supplicant
  busybox udhcpc -fnqiwlp2s0 &&exit
  ifconfig enp3s0 up; busybox udhcpc -fnqienp3s0
elif test "$1" = airpl; then
  ifconfig enp3s0 down; rfkill block all; kill `pgrep dhcp`
  watch wpa_cli status
elif test "$1" = cool; then cd /sys/*/cpu/devices
  for i in *; do cat $i/*/c*min* >$i/*/s*max*; done; watch cat */*/s*cur*
elif test "$1" = turbo; then cd /sys/*/cpu/devices
  for i in *; do cat $i/*/c*max* >$i/*/s*max*; done; watch cat */*/s*cur*
else sed '/^# ctl/!d;s/# /usage: /' $0; sed '2!d;s/# /\n/' $0; fi
