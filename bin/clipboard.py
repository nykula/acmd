#!/usr/bin/env python2
# -*- coding: utf-8 -*-
#
# Native gtk_clipboard_set_with_data is closed for introspection, so Gjs can't
# use it directly. https://bugzilla.gnome.org/show_bug.cgi?id=656312
#
# Based on Clipfiles by Daniel Carvalho:
# http://mailman.daa.com.au/pipermail/pygtk/2010-January/018188.html
#
# Use it like this:
# clipboard.py copy file:///foo file:///bar file:///baz
# clipboard.py cut file:///foo file:///bar file:///baz
# clipboard.py paste

import gtk
import sys

action = sys.argv[1]
uris = "\n".join(sys.argv[2:])
gnome_copied_files = action + "\n" + uris
targets = [("x-special/gnome-copied-files",0,0), ("text/uri-list",0,0), ("text/plain;charset=utf-8",0,0)]

def get_func(clipboard, selection_data, info, data):
  if selection_data.get_target() == "x-special/gnome-copied-files":
    selection_data.set(selection_data.get_target(), 8, gnome_copied_files)
  else:
    selection_data.set(selection_data.get_target(), 8, uris)

def clear_func(clipboard, data):
  gtk.main_quit()

def received_func(clipboard, selection_data, data):
  if selection_data.data is not None:
    print(selection_data.data)

  gtk.main_quit()

clipboard = gtk.clipboard_get()

if action == "copy" or action == "cut":
  clipboard.set_with_data(targets, get_func, clear_func)
else:
  clipboard.request_contents("x-special/gnome-copied-files", received_func)

gtk.main()
