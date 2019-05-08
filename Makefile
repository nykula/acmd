%: %.c
	$(CC) $(CFLAGS) -o $@ $^ `make -s depend` $(LDFLAGS)
all: config files
config:
	uname -mrs
	echo "def Settings(**kwargs): return {'flags': '`make -s depend`'.split(' ')}" >.ycm_extra_conf.py
	git status -bs
	git diff | cat
depend:
	echo -E -Wall -lEGL -lGLESv2 -lfreetype -I/usr/include/freetype2 -lrt -lwayland-client -lwayland-egl
format:
	clang-format -i *.c
