#ifndef CASYNCFRAMEMANAGER_H
#define CASYNCFRAMEMANAGER_H

#include "frames.h"

class CAsyncFrameManager : public Napi::AsyncWorker 
{
public:
    CAsyncFrameManager(CFrames* frames, Napi::Function& callback) 
        : Napi::AsyncWorker(callback), frames(frames) {}
    ~CAsyncFrameManager() {}

    void Execute() {
        frames->Send() ;
    }

    void OnOK() {
        /*
        Callback().Call({
            Env().Undefined(), 
            Napi::String::New(Env(), frames->GetId()),
            Napi::String::New(Env(), frames->GetType())
        });
        */
    }

private:
    CFrames * frames;
};

#endif // CASYNCFRAMEMANAGER_H
