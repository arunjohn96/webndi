#ifndef COMMAND_H
#define COMMAND_H

#include <map>

enum StreamType {
	AUDIO,
	VIDEO
};

enum Command {
	InvalidCommand,                          //  0
	ListChannel,                             //  1
	CreateSendAudioChannel,                  //  2
	CreateReceiveAudioChannel,               //  3
	DeleteAudioChannel,
	SendAudio,
	ReceiveAudio,
	AudioChannelControl,
	CreateSendVideoChannel,
	CreateReceiveVideoChannel,               //  10
	DeleteVideoChannel,
	SendVideo,
	ReceiveVideo,
	VideoChannelControl,
	Stop,                                    //  15
	Sleep
};

static const std::map<std::string, Command> Commands 
{
	{ "list-channel", ListChannel },
	{ "create-send-audio-channel", CreateSendAudioChannel },
	{ "create-receive-audio-channel", CreateReceiveAudioChannel },
	{ "delete-audio-channel", DeleteAudioChannel },
	{ "send-audio", SendAudio },
	{ "receive-audio", ReceiveAudio},
	{ "audio-channel-control", AudioChannelControl},
	{ "create-send-video-channel", CreateSendVideoChannel },
	{ "create-receive-video-channel", CreateReceiveVideoChannel },
	{ "delete-video-channel", DeleteVideoChannel },
	{ "send-video", SendVideo},
	{ "receive-video", ReceiveVideo},
	{ "video-channel-control", VideoChannelControl},
	{ "stop", Stop},
	{ "sleep", Sleep}
};

#endif // COMMAND_H
