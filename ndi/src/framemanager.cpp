#include <napi.h>
#include <map>
#include "syncframemanager.h"
#include "asyncframemanager.h"

map<string, CChannel*> CChannel::list ; 

Napi::Value setFrames(const Napi::CallbackInfo& info) {

    if (info.Length() != 4) {
        Napi::Error::New(info.Env(), "Missing Parameters").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }
    if (!info[0].IsString()) {
        Napi::Error::New(info.Env(), "Invalid Mode").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }
    if (!info[1].IsObject()) {
        Napi::Error::New(info.Env(), "Invalid Properties").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }
    if (!info[2].IsArrayBuffer()) {
        Napi::Error::New(info.Env(), "Invalid Frame Buffer").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }
    if (!info[3].IsFunction()) {
        Napi::Error::New(info.Env(), "Invalid Call Back Method").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }

    Napi::String mode = info[0].As<Napi::String>() ;
    Napi::Object properties = info[1].As<Napi::Object>() ;
    Napi::ArrayBuffer framebuffer = info[2].As<Napi::ArrayBuffer>() ;
    Napi::Function callback = info[3].As<Napi::Function>();

    CFrames * frames = new CFrames(properties, framebuffer) ;

    if (mode.Utf8Value()=="async")
    {
         CAsyncFrameManager* frameManager = new CAsyncFrameManager(frames, callback) ;
         frameManager->Queue();
    }
    else 
    {
        CSyncFrameManager* frameManager = new CSyncFrameManager(frames) ;
        frameManager->Execute();
    }
    return info.Env().Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports["ndi"] = Napi::Function::New(env, setFrames);
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
