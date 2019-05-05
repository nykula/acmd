%: %.c
	$(CC) $(CFLAGS) -o $@ $^ .xdg*.c `make -s depend` $(LDFLAGS)
all: config files
config:
	uname -mrs
	echo "def Settings(**kwargs): return {'flags': '`make -s depend`'.split(' ')}" >.ycm_extra_conf.py
	git status -bs
	git diff | cat
	wayland-scanner client-header /usr/share/wayland-protocols/stable/xdg-shell/xdg-shell.xml .xdg-shell-client-protocol.h
	wayland-scanner private-code /usr/share/wayland-protocols/stable/xdg-shell/xdg-shell.xml .xdg-shell-protocol.c
depend:
	echo -E -lrt -lwayland-client -lwayland-egl -lEGL -lGL
format:
	clang-format -i *.c
