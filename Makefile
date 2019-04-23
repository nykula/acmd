%.so: %.c
	$(CC) $(CFLAGS) `make -s depend` $^ -shared -o $@ $(LDFLAGS)
%: %.c
	$(CC) $(CFLAGS) `make -s depend` $^ -o $@ $(LDFLAGS)
all: config files libgiovolmon.so
config:
	uname -mrs
	echo "def Settings(**kwargs): return {'flags': '`make -s depend`'.split(' ')}" >.ycm_extra_conf.py
	git status -bs
	git diff | cat
depend:
	pkg-config --cflags --libs gio-2.0 --libs gtk+-3.0
format:
	clang-format -i *.c
