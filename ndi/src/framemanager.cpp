#include <napi.h>
#include <map>
#include "audiomanager.h"
#include "videomanager.h"

map<string, CChannel*> CChannel::list; 

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

        case CreateSendAudioChannel:
            CAudioManager::CreateSendChannel(properties);
            break;

        case CreateReceiveAudioChannel:
            CAudioManager::CreateReceiveChannel(properties);
            break;

        case DeleteAudioChannel:
            CAudioManager::DeleteChannel(properties);
            break;

        case SendAudio:
        case ReceiveAudio:
            CAudioManager::Execute(properties, info);
            break;

//		case DetachAudioBuffer:
//			CAudioManager::DetachAudioBuffer(properties);
//			break;

        case AudioChannelControl:
            CAudioManager::ChannelControl(properties);
            break;

        case CreateSendVideoChannel:
            CVideoManager::CreateSendChannel(properties);
            break;

        case CreateReceiveVideoChannel:
            CVideoManager::CreateReceiveChannel(properties);
            break;

        case DeleteVideoChannel:
            CVideoManager::DeleteChannel(properties);
            break;

        case SendVideo:
        case ReceiveVideo:
            CVideoManager::Execute(properties, info);
            break;

        case VideoChannelControl:
            CVideoManager::ChannelControl(properties);
            break;

//		case DetachVideoBuffer:
//			CAudioManager::DetachAudioBuffer(properties);
//			break;

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
