#ifndef CSYNCFRAMEMANAGER_H
#define CSYNCFRAMEMANAGER_H

#include "frames.h"

class CSyncFrameManager
{

public:
    CSyncFrameManager(CFrames* frames) : frames(frames){} 
    ~CSyncFrameManager() {}

    void Execute() {
        frames->Send() ;
    }
private:
    CFrames* frames;
};

#endif // CSYNCFRAMEMANAGER_H
