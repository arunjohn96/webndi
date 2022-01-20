#include "channelmanager.h"

void CChannelManager::ListChannel(Properties& properties, const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    Napi::Function callback = info[2].As<Napi::Function>();

    std::vector<std::string> v_channel = CNdi::GetAllSourceNames(
        CUtil::GetProperty(properties, "channelGroup"),
        CUtil::GetProperty(properties, "channelIps"),
        stoi(CUtil::GetProperty(properties, "channelSearchMaxWaitTime", "0")),
        stoi(CUtil::GetProperty(properties, "channelSearchMaxTrials", "0"))
    );

    Napi::Array lst_channel = Napi::Array::New(env, v_channel.size());
    for (size_t index = 0; index < v_channel.size(); index++)
    {
        lst_channel[index]=v_channel[index];
        CUtil::log(v_channel[index]);

    }
    callback.Call({lst_channel}) ;
}

void CChannelManager::DeleteChannel(Properties& properties)
{
    CChannel::kick(CUtil::GetId(properties));
}

void CChannelManager::ChannelControl(Properties& properties)
{
    CChannel* channel = CChannel::get(CUtil::GetId(properties));
    if(channel) {
        channel->stream()->command(properties);
    }
}
