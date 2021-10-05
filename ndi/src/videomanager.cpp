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

void CVideoManager::Execute(Properties& properties, const Napi::CallbackInfo& info)
{
	CChannel* channel = CChannel::get(CUtil::GetId(properties));
	if(channel) {
		channel->stream()->execute(properties, info);
	}
}

