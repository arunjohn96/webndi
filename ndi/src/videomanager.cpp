#include "videomanager.h"

void CVideoManager::CreateSendChannel(Properties& properties)
{
    CUtil::log(properties, "creating video send");
    CStream* stream = new CSendVideo(properties);
    CChannel::book(stream);
}

void CVideoManager::CreateReceiveChannel(Properties& properties)
{
    CUtil::log(properties, "creating video receive");
    CStream* stream = new CReceiveVideo(properties);
    CChannel::book(stream);
}

void CVideoManager::DeleteChannel(Properties& properties)
{
    CUtil::log(properties, "deleting video");
    CChannel::kick(CUtil::GetId(properties));
}

void CVideoManager::ChannelControl(Properties& properties)
{
    CChannel* channel = CChannel::get(CUtil::GetId(properties));
    if(channel) {
        channel->stream()->command(properties);
    }
}

void CVideoManager::SendVideo(Properties& properties, const Napi::CallbackInfo& info)
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

void CVideoManager::ReceiveVideo(Properties& properties, const Napi::CallbackInfo& info)
{
	if (info[2].IsFunction() && info[3].IsFunction()) 
	{
		Napi::Function logger = info[2].As<Napi::Function>(); 
		Napi::Function updator = info[3].As<Napi::Function>() ;

		CChannel* channel = CChannel::get(CUtil::GetId(properties));
		if(channel) {
			CAsyncManager* am = new CAsyncManager(VIDEO, channel, logger, updator);
			am->Queue();
		}
	}
}

