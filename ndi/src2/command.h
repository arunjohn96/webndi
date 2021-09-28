#ifndef COMMAND_H
#define COMMAND_H

enum Command {
	InvalidCommand,                          //  0
	CreateSendAudioChannel,                  //  1
	CreateReceiveAudioChannel,               //  2
	DeleteAudioChannel,
	SendAudio,
	ReceiveAudio,
	AudioChannelControl,
	CreateSendVideoChannel,
	CreateReceiveVideoChannel,               //  8
	DeleteVideoChannel,
	SendVideo,
	ReceiveVideo,
	VideoChannelControl,
	Stop,                                    // 13
	Sleep
};

static const std::map<std::string, Command> Commands 
{
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
