#ifndef CAUDIOMANAGER_H
#define CAUDIOMANAGER_H

#include <napi.h>
#include <map>
#include "sendaudio.h"
#include "receiveaudio.h"

class CAudioManager
{
public:
    static void CreateSendChannel(Properties& properties);
    static void CreateReceiveChannel(Properties& properties);
    static void DeleteChannel(Properties& properties);
	static void ChannelControl(Properties& properties);
	static void Execute(Properties& properties, const Napi::CallbackInfo& info);
//    static void SendAudio(Properties& properties, Napi::ArrayBuffer& frames);
//    static void ReceiveAudio(Properties& properties);
//	static std::string GetProperty(Properties& properties, std::string property);
//    static void log(std::string message, Properties& properties);
};

#endif // CAUDIOMANAGER_H
