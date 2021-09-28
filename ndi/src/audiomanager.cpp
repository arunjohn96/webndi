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

void CAudioManager::DeleteChannel(Properties& properties)
{
    CUtil::log(properties, "deleting audio");
    CChannel::kick(CUtil::GetId(properties));
}

void CAudioManager::ChannelControl(Properties& properties)
{
	CChannel* channel = CChannel::get(CUtil::GetId(properties));
	if(channel) {
		channel->stream()->command(properties);
	}
}

void CAudioManager::Execute(Properties& properties, const Napi::CallbackInfo& info)
{
	CChannel* channel = CChannel::get(CUtil::GetId(properties));
	if(channel) {
		channel->stream()->execute(properties, info);
	}
}

