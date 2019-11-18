#!/bin/sh
# Control battery usage, Ethernet and WiFi, BT earphones, and backlight.
# 0BSD 2019 Denys Nykula <nykula@ukr.net>
# ctl bat|net|ear|led
eat() { while read x; do ${ECHO:-printf '%s\n'} "$x"; done; }
tip() { echo "===> [Tip] $@"; }
wait() { for i in {1..4}; do echo -n .; sleep 1; done; }
if test "$1" = bat; then cd /sys/*/cpu/devices; for i in *; do
  if test `cat $i/*/c*max*` = `cat $i/*/s*max*`; then cat $i/*/c*min*
  else cat $i/*/c*max*; fi >`ls $i/*/s*max*`; done
  watch cat */*/s*cur* /proc/loadavg /sys/class/power_supply/*/charge_now
elif test "$1" = hdd; then for i in /sys/block/*/device/power; do f=$i/*_ms
  if test `cat $f` = -1; then echo 10000; else echo -1; fi >`ls $f`
  echo auto >$i/control; done
elif test "$1" = lp; then ifconfig -a |grep -o ^$2'[a-z0-9]*'
elif test "$1" = disco; then rfkill block wlan; for i in e w
  do ifconfig `ctl lp $i` down; done; kill `pgrep dhcp` `pgrep wpa_supplicant`
elif test "$1" = net; then ctl disco; rfkill unblock wlan; wait; for i in e w
  do ifconfig `ctl lp $i` up; done
  (wpa_supplicant -i`ctl lp w` -c /etc/wpa*.conf; sleep 8; wpa_cli scan)&
  if busybox udhcpc -fnqi`ctl lp e`;then rfkill block wlan; pkill wpa_supplicant
  tip Ctrl+D to off; cat; ctl disco; exit; fi; ifconfig `ctl lp e` down
  wpa_cli scan_results; if ! wpa_cli status |grep -q wpa_state=COMPLETED; then
    tip ctl wpa YOUR_NET [or] ctl ess NO_PASS [then] Ctrl+D; sh; fi
  pkill -HUP wpa_supplicant;busybox udhcpc -fnqi`ctl lp w`;echo `wpa_cli status`
  tip Ctrl+D to off; wpa_cli; ctl disco
elif test "$1" = pair; then echo paired-devices |bluetoothctl |
  awk '/^Device/{print$2}'
elif test "$1" = bt; then echo info `ctl pair` |bluetoothctl |
  grep -q '^\s*Connected: yes'
elif test "$1" = btoff; then pgrep bluetoothd &&echo power off |bluetoothctl
  rfkill block bluetooth; killall bluetoothd bluealsa{,-aplay} dbus-daemon
  rm -r /etc/asound.conf /var/run/{blue*,dbus*}
elif test "$1" = ear; then ctl btoff; mkdir /var/run/dbus
  dbus-daemon --system; rfkill unblock bluetooth; wait
  /usr/libexec/*/bluetoothd -n &/usr/pkg/libexec/*/bluetoothd -n &wait
  echo -e 'power on\nscan on' |bluetoothctl; bluealsa &wait; a=0
  while test -n "`ctl pair`" &&echo connect `ctl pair` |bluetoothctl &&
  wait &&! ctl bt; do wait;ctl bt&&break; echo power off |bluetoothctl;wait
  echo power on |bluetoothctl; wait; ((a++)); test $a = 3 &&break; done
  if ! ctl bt; then tip pair 12:34 [Tab Enter] connect 12:34 [Tab Enter ^D]
  bluetoothctl; fi; bluealsa-aplay `ctl pair` &tee /etc/asound.conf <<EOF
defaults.bluealsa { device "`ctl pair`" }
pcm.!default { type plug slave { pcm "bluealsa" } }
ctl.!default { type bluealsa }
EOF
  tip Ctrl+D to off; bluetoothctl; ctl btoff
elif test "$1" = vol; then amixer sget Master |
  awk '/Limits/{printf$5"*0."}/([0-9]+%)/{gsub(/[[\]%]/,"");print$4}' |bc
elif test "$1" = dentry; then
  printf '[Desktop Entry]\nExec=%s\nName=%s\nType=Application\nVersion=1.0\n' "$2" "$3"
elif test "$1" = del; then
  perl -i -0pe "s/\nnetwork=\{\s*?ssid=\"$2\"[\s\S]*?\}//" /etc/wpa*.conf 
elif test "$1" = ess; then >>/etc/wpa_supplicant.conf printf \
  'network={\nssid="%s"\nkey_mgmt=NONE\n}\n' "$2"
elif test "$1" = wpa; then >>/etc/wpa_supplicant.conf wpa_passphrase "$2"
elif test "$1" = res; then dmesg |grep -Eo '[0-9]{3,}x[0-9]{3,}'
elif test "$1" = png; then x=`mktemp`; convert -size `ctl res` \
  xc:white -font /usr/share/fonts/liberation/LiberationSerif-Regular.ttf \
  -pointsize 14 -annotate +8+18 "`cat`" png:- |mpv -vo=drm -pause -loop -
elif test "$1" = eml; then perl -pe 'use MIME::QuotedPrint;$_=decode_qp($_)'
elif test "$1" = hjk; then while read -sn1 x; do case $x in '')echo l;;
  e|h|j|k|l|r|s|z)echo $x;; q|`echo -e '\04'`)echo q; exit;;
  `echo -e '\e'`)read -n1 y; if test $y = [; then read -n1 z; case $z in
    D)echo h;; B)echo j;; A)echo k;; C)echo l;;
    5|6)read -sn1 a; case $z$a in 5~)echo Up;; 6~)echo Dn
    esac; esac; fi; if test $y = O; then read -n1 z; case $z in
    S)echo e; esac; fi;; *) echo; esac; done
elif test "$1" = led; then f=`ls /sys/class/backlight/*/brightness`
  fm=`dirname $f`/max_brightness; echo `cat $f`/`cat $fm`; ctl hjk |
  while read x;do b=`cat $f`; >$f 2>/dev/null expr $b + `case $x in
  h)echo -1;; j)echo -100;; k)echo 100;; l)echo 1;; Dn)echo -500;; Up)echo 500
  esac`; echo -e '\r\033[1A\033[J'`cat $f`/`cat $fm`; done
elif test "$1" = dev; then cd /$2
  for i in 'devtmpfs - dev' 'proc - proc' 'sysfs - sys';do mount -t$i;done
  mkdir dev/pts;for i in 'devpts - dev/pts';do mount -t$i;done
elif test "$1" = inv; then for i in 0ffffff 7000000 bffaa00 f333333
  do echo -en "\e]P$i"; done
elif test "$1" = caps; then setkeycodes 3a 29
elif test "$1" = ren; then xs=`mktemp`; ys=`mktemp`; zs=`mktemp`; shift
  ls -1d -- "$@" |tee $xs |>$ys ${CAT:-eat};vi $ys; i=0;while read y;do((i++))
  alias y="$y" x="`sed $i\!d $xs`"; x="`alias x |sed 's/^.*\?=//'`"
  y="`alias y |sed 's/^.*\?=//'`"; test "$x" != "$y" &&>>$zs echo -E \
  mv -v "$x" "$y"; done <$ys; vi $zs &&eval "`cat $zs`"; rm $xs $ys $zs
elif test "$1" = mpv; then shift; for i in "$@"; do
  test "$VO" != null &&(ffmpeg4 -re -i "$i" \
  -pix_fmt bgra -s `ctl res` -f fbdev '' -v 0 -f wav - |aplay - 2>/dev/null ||
  ffmpeg4 -re -i "$i" -pix_fmt bgra -s `ctl res` -f fbdev '' -v 0) ||
  ffmpeg4 -re -i "$i" -f wav - |aplay -; done
elif test "$1" = say; then shift; espeak -w/proc/self/fd/1 "$@" |aplay -
elif test "$1" = cp; then R=`mktemp`; u=`mktemp`
  pkg_info -R \* |perl -0pe 's/(^|\n)I.*:\n*(R.*:(\n.+)+|\*.*\n\*.*)\n//g' |
  sed -E '/\d:$/!d;s/.* |-\d.*\d:$//g' |sort >$R
  pkg_info -u |sed -E 's/-\d.*\d .*//' |sort -u >$u; comm -23 $R $u; rm $R $u
elif test "$1" = c; then while test -n "`ctl cp`"
  do pkg_delete -v `ctl cp`; done
elif test "$1" = u; then for i in /usr/*src{,/*/.git/..};do cd $i;git pull;done
  for i in /usr/*src/dist*/*; do tar tf $i >/dev/null ||rm -r $i; done
  pkg_info -u |sed 's/-\d.*//' |while read i; do cd /usr/*src/*/$i; pwd
  bmake fetch-list |sh; done
elif test "$1" = epub; then d=`mktemp -d`; test -n "$d" ||exit; (cd $d
  unzip "$2"; find * -type f -exec mv "{}" . \;
  for j in {,x}html; do for i in *.$j; do cat "$i" |while read x
  do printf '%s ' "$x"; done >`basename "$i" .$j`.htm; done; done
  perl -0pe 's,(xt>)\s+(</nav.*)\s+(<c),\1\2\3,g' *.ncx |>toc.htm sed -E \
  's,^.+?>([^<]+)<.*?"([^"]+)\.x?html".*$,<a href="\2.htm">\2.htm \1</a><p>,'
  sed -i '/htm">/!d' toc.htm; find * -not -name '*.htm' -delete
  for i in 's/style="[^"]+"//g' "s/style='[^']+'//g" 's/class="[^"]+"//g' \
  "s/class='[^']+'//g" 's/<link[^>]+>//g' 's/<div/<p/g;s,/div>,/p>,g' \
  's,OEBPS/,,g' 's,<([^/apt]|/[^apt])[^>]*>,,g' 's,href="[^"/]*/,href=",g'
  do sed -Ei "$i" *; done; rm \*.{,x}htm{,l}); mv $d/* .; rm -r $d
elif test "$1" = dirr; then t=`mktemp -d`; echo >$t/buf
  echo ls -1p >$t/ls; `<$t/ls` >$t/fs; head -1 $t/fs >$t/cur
  (echo;ctl hjk)|while read k; do clear; case $k in
  e)f="`<$t/cur`"; tmux splitw -hc "$PWD" vi "$f";;
  z)if test "`<$t/ls`" = "`echo ls -1ap`"; then echo ls -1p >$t/ls
    else echo ls -1ap >$t/ls; fi; `<$t/ls` >$t/fs;;
  h)cd ..; `<$t/ls` >$t/fs;;
  l)f="`<$t/cur`"
    if test "${f%/}" != "$f"; then cd "$f"; `<$t/ls` >$t/fs
    else tmux splitw -hc "$PWD" lynx "$f"; fi;;
  j)echo >$t/buf; cat $t/fs |while read f; do
    if test "`<$t/buf`" = y; then echo "$f" >$t/cur; break; fi
    if test "`<$t/cur`" = "$f"; then echo y >$t/buf; fi; done;;
  k)echo >$t/buf; cat $t/fs |while read f; do
    if test "`<$t/cur`" = "$f"; then echo "`<$t/buf`" >$t/cur; break; fi
    echo "$f" >$t/buf; done;;
  r)f="`<$t/cur`"; tmux splitw -hc "$PWD" ctl ren "$f";;
  s)tmux splitw -hc "$PWD" env t=$t sh -l;;
  esac; echo >$t/buf; cat $t/fs |while read f; do
    if test "`<$t/cur`" = "$f"; then echo y >$t/buf; break; fi; done
  if test "`<$t/buf`" != y; then head -1 $t/fs >$t/cur; fi
  pwd; cat $t/fs |while read f; do
    test "`<$t/cur`" = "$f" &&echo "> $f" ||echo "- $f"; done
  echo "ehjklqrsz> $k"; done; rm -r $t; echo
elif test "$1" = dir; then ctl dirr |(
  eq=; h=$((LINES-1)); old=; pad=1; top=0; xs=; w=$((COLUMNS/2-1))
  skip() { [ $eq -gt 0 ] &&printf "\033[${eq}B"; eq=0; }
  clear; clr="`printf '\033[2J\033[H'`"; while read x; do
  col=; while [ ${#x} -ge $w -a ${#col} -lt $w ]; do col=$col?; done
  if [ -n "$col" ]; then xs="`printf '%s\n%s' "$xs" "${x%${x#$col}}"`"
  else xs="`printf '%s\n%s' "$xs" "$x"`"; fi
  case $x in ehjk*);; *)continue; esac
  cur=0; xs="${xs#?$clr}"; wcl=0; while read x; do
    case $x in '> '*)cur=$wcl; esac
    ((wcl++)) done <<<$xs
  while [ $top -gt $cur -o $top -gt $((wcl-h)) ]; do ((top--)) done
  while [ $top -lt $((cur+1-h+pad)) -o $top -lt 0 ]; do ((top++)) done
  new="`i=0; while read x; do
    [ $i -ge $((top+pad)) -a $i -lt $((top+h-pad)) -o \
      $i -lt $pad -o $i -ge $((wcl-pad)) ] &&printf '%s\n' "$x"
    ((i++)) done <<<$xs`"
  eq=0; k=0; printf '\033[H'; while read y; do
    j=0; while read x; do
      [ $j = $k ] &&
        if [ "$x" = "$y" ]; then ((eq++))
        else skip; printf '\033[K%s\r' "$y"; ((eq++)) fi
      ((j++)) done <<<$old
    if [ $j -le $k ]; then skip; printf '\033[K%s\r' "$y"; ((eq++)) fi
    ((k++)) done <<<$new
  skip; printf '\033[J'; old="$new"; xs=; done)
else sed '/^# ctl/!d;s/# /usage: /' $0; sed '2!d;s/# /\n/' $0; fi
