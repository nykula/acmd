#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#define lock pthread_mutex_lock
#define unlock pthread_mutex_unlock

typedef struct Lines {
  char *line;
  struct Lines *prev;
} Lines;

struct TT {
  char done;
  Lines *lines;
  pthread_mutex_t q;
} TT;

void *find(void *_) {
  size_t len;
  char *line;
  Lines *lines;
  FILE *p = popen("./find .", "r");
  while (line = 0, -1 != getline(&line, &len, p)) {
    lines = malloc(sizeof(Lines)), lines->line = line;
    lock(&TT.q), lines->prev = TT.lines, TT.lines = lines, unlock(&TT.q);
  }
  pclose(p);
  lock(&TT.q), TT.done = 1, unlock(&TT.q);
  return 0;
}

int main() {
  char done, once_more = 0;
  pthread_t find$;
  Lines *lines;

  pthread_mutex_init(&TT.q, 0);
  pthread_create(&find$, 0, find, 0);
  while (lock(&TT.q), done = TT.done, unlock(&TT.q), !done || !once_more++) {
    lock(&TT.q);
    while (TT.lines) {
      printf("%s", TT.lines->line), free(TT.lines->line);
      lines = TT.lines->prev, free(TT.lines), TT.lines = lines;
    }
    unlock(&TT.q);
  }
}
