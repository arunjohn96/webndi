#ifndef CVIDEOMANAGER_H
#define CVIDEOMANAGER_H

#include <napi.h>
#include <map>
#include "sendvideo.h"
#include "receivevideo.h"

class CVideoManager
{
public:
    static void CreateSendChannel(Properties& properties);
    static void CreateReceiveChannel(Properties& properties);
    static void DeleteChannel(Properties& properties);
	static void ChannelControl(Properties& properties);
	static void Execute(Properties& properties, const Napi::CallbackInfo& info);
//    static void SendVideo(Properties& properties, Napi::ArrayBuffer& frames);
//    static void ReceiveVideo(Properties& properties);
//	static std::string GetProperty(Properties& properties, std::string property);
//    static void log(std::string message, Properties& properties);
};

#endif // CVIDEOMANAGER_H
