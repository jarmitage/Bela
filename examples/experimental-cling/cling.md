# Cling and Bela

## About Cling

Cling is a C++ interpreter developed at CERN as part of the ROOT project:

- Main website: https://root.cern.ch/cling
- Code: https://github.com/root-project/cling
- Article: http://iopscience.iop.org/article/10.1088/1742-6596/396/5/052071/meta
- Talk: https://www.youtube.com/watch?v=Lbi7MLS03Yc
- User Guide: https://root.cern.ch/root/htmldoc/guides/users-guide/ROOTUsersGuide.html#the-c-interpreter-cling
- Doxygen: http://cling.web.cern.ch/cling/doxygen/

## Installation instructions

- Presumably you already are, but if you are not, you need to be on this forked branch of the Bela repo: https://github.com/jarmitage/Bela/tree/dev-cling
- Run `make lib` from `/root/Bela` to build the Bela dynamic libraries (https://github.com/BelaPlatform/Bela/wiki/Using-the-Bela-core-with-other-programs)
- Download this build of Cling https://www.dropbox.com/s/9t1cq3kxpx1keif/cling_2018-05-25_armhf.tar.bz2?dl=0
- Copy its contents to `/root/cling` on Bela
- Add the binaries to your `PATH`:
```
nano ~/.bashrc
export PATH="/root/cling/bin:$PATH" # add this line!
source ~/.bashrc
```
- Try `cling`, you should see:
```
****************** CLING ******************
* Type C++ code and press enter to run it *
*             Type .q to exit             *
*******************************************
[cling]$ 
```

## Using the template

See the comments at the bottom of `cling_default.cpp` for an explainer of how the template currently works.

In essence:
- Create a new C++ project
- Replace `render.cpp` with `cling_default.cpp`
- Follow the instructions in `cling_default.cpp`

## TODO (all experimental)

- IDE integration and integrated feedback
- Exposing BelaContext to the REPL
- Strategies for 'live coding' Bela programs
