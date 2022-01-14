#include "audiomanager.h"

void CAudioManager::CreateSendChannel(Properties& properties)
{
    CUtil::log(properties, "creating audio send");
    CStream* stream = new CSendAudio(properties);
    CChannel::book(stream);
}

void CAudioManager::CreateReceiveChannel(Properties& properties)
{
    CUtil::log(properties, "creating audio receive");
    CStream* stream = new CReceiveAudio(properties);
    CChannel::book(stream);
}

void CAudioManager::SendAudio(Properties& properties, const Napi::CallbackInfo& info)
{
    if (info[2].IsArrayBuffer()) 
    {
        Napi::ArrayBuffer framebuffer = info[2].As<Napi::ArrayBuffer>();
        size_t bsize = framebuffer.ByteLength() / sizeof(uint8_t);
        uint8_t* buffer = reinterpret_cast<uint8_t*>(framebuffer.Data());

		CChannel* channel = CChannel::get(CUtil::GetId(properties));
		if(channel) {
			channel->stream()->execute(buffer, bsize);
		}
    }
}

void CAudioManager::ReceiveAudio(Properties& properties, const Napi::CallbackInfo& info)
{
	if (info[2].IsFunction() && info[3].IsFunction()) 
	{
		Napi::Function logger = info[2].As<Napi::Function>(); 
		Napi::Function updator = info[3].As<Napi::Function>() ;

		CChannel* channel = CChannel::get(CUtil::GetId(properties));
		if(channel) {
			CAsyncManager* am = new CAsyncManager(AUDIO, channel, logger, updator);
			am->Queue();
		}
	}
}

