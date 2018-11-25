/*
 *
 * Bela Cling demo template
 * http://bela.io // https://root.cern.ch/cling
 * Jack Armitage 2018
 *
 * See comments at the bottom for usage
 *
 */

#include <Bela.h>
#include <cmath>

extern void (*gBelaRender) (BelaContext *, void *);

BelaContext* bela = {}; // If you write to this, weird things **will** happen!

void interrupt_handler (int var) {
  gShouldStop = true;
}

bool setup (BelaContext *context, void *) {
  bela = context;

  return true;
}

void cling_render (BelaContext *context, void *) {

}

void render (BelaContext *context, void *) {
  for(unsigned int n = 0; n < context->audioFrames; n++) {
    for(unsigned int ch = 0; ch < context->audioInChannels; ch++){
      audioWrite(context, n, ch, audioRead(context, n, ch));
    }
  }
}

void cleanup (BelaContext *context, void *) {

}

void cling_default() {
  BelaInitSettings* settings = Bela_InitSettings_alloc(); // Default settings
  Bela_defaultSettings(settings);
  settings->setup = setup;
  settings->render = render;
  settings->cleanup = cleanup;
  // Issue: if high performance mode is set and render() is empty,
  // you will hear a high-pitched noise:
  // https://github.com/BelaPlatform/Bela/issues/500
  settings->highPerformanceMode = 1; // https://github.com/BelaPlatform/Bela/blob/master/include/Bela.h#L399

  if(Bela_initAudio(settings, 0) != 0) { // Initialise the PRU audio device
    Bela_InitSettings_free(settings);
    fprintf(stderr,"Error: unable to initialise audio\n");
    return 1;
  }
  Bela_InitSettings_free(settings);

  if(Bela_startAudio()) { // Start the audio device running
    fprintf(stderr,"Error: unable to start real-time audio\n"); 
    Bela_stopAudio(); // Stop the audio device
    Bela_cleanupAudio(); // Clean up any resources allocated for audio
    return 1;
  }
}

/*

This code assumes you have already installed Cling on Bela following the instructions in `cling.md`.
If not, start there.

Start Cling, then:

```
.I /root/Bela/include
.L /root/Bela/lib/libbela.so
.L /root/Bela/lib/libbelaextra.so
.x /root/Bela/projects/[project_folder]/[project_main].cpp
```

If you need to load other classes before your main file, 
you can load them before the `.x` command,
but make sure you DO NOT include them in [project_main].cpp
as this will no longer be necessary:

```
.L /root/Bela/projects/[project_folder]/[project_class].cpp
```

If you rename the function `cling_default()` to the name of your file, Cling will load it automatically.
Then, based on modifications in PRU.cpp, you can swap to a new render function, 
or any other function of type `void func (BelaContext *context, void *) {}`:

```
gBelaRender = cling_render
```

From Cling you can access anything included / global / public.
You can even read from the main Bela context (writing to it is not advised!) and use the API utilities:

```
[cling]$ bela->audioSampleRate
(const float) 44100.0f
[cling]$ analogRead(bela, 0, 0)
(float) 0.000259399f
```

To monitor the performance of Cling, you can run:
```
watch -n 0.4 cat /proc/xenomai/sched/stat
```

Note that if you make an error in Cling such as loading an incorrect path, 
you will likely need to restart Cling.
You can not currently redefine identifiers in Cling, in that case you first
need to `.undo N` where N is number of steps before you can redefine something.

*/
