#include <napi.h>
#include "audiomanager.h"
#include "videomanager.h"
#include "channelmanager.h"
#include "asyncmanager.h"

map<string, CChannel*> CChannel::list; 
map<string, NDIlib_send_instance_t> CNdi::lst_sender;
map<string, NDIlib_recv_instance_t> CNdi::lst_receiver;

Napi::Value setFrames(const Napi::CallbackInfo& info) 
{

    Properties properties;
    Napi::Object frameproperties;

    if (info.Length() < 2) 
    {
        Napi::Error::New(info.Env(), "Missing Parameters").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }
    
    if (info.Length() == 3 && !(info[2].IsArrayBuffer() || info[2].IsFunction()))
    {
        Napi::Error::New(info.Env(), "Invalid Manifest").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }

    if (!info[0].IsString()) 
    {
        Napi::Error::New(info.Env(), "Invalid Command").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }

    if (!info[1].IsObject()) 
    {
        Napi::Error::New(info.Env(), "Invalid Properties").ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }

    frameproperties = info[1].As<Napi::Object>();
    Napi::Array keys = frameproperties.GetPropertyNames();

    for(size_t index=0; index < keys.Length(); index++) 
    {
        std::string key = (static_cast<Napi::Value>(keys[index])).ToString();
        std::string value = frameproperties.Get(key).ToString();
        properties[key]  = value;
    }

    switch( CUtil::Evaluate(info[0].As<Napi::String>()) )
    {

        case ListChannel:
            CChannelManager::ListChannel(properties, info);
            break;

        case ChannelControl:
            CChannelManager::ChannelControl(properties);
            break;

        case CreateSendAudioChannel:
            CAudioManager::CreateSendChannel(properties);
            break;

        case CreateReceiveAudioChannel:
            CAudioManager::CreateReceiveChannel(properties);
            break;

        case DeleteAudioChannel:
            CChannelManager::DeleteChannel(properties);
            break;

        case SendAudio:
            CAudioManager::SendAudio(properties, info);
            break;

        case ReceiveAudio:
            CAudioManager::ReceiveAudio(properties, info);
            break;

        case CreateSendVideoChannel:
            CVideoManager::CreateSendChannel(properties);
            break;

        case CreateReceiveVideoChannel:
            CVideoManager::CreateReceiveChannel(properties);
            break;

        case DeleteVideoChannel:
            CChannelManager::DeleteChannel(properties);
            break;

        case SendVideo:
            CVideoManager::SendVideo(properties, info);
            break;

        case ReceiveVideo:
            CVideoManager::ReceiveVideo(properties, info);
            break;

        case Sleep:
            CUtil::sleep(properties);
            break;

        default:
            break;
    }
    return info.Env().Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports["ndi"] = Napi::Function::New(env, setFrames);
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
