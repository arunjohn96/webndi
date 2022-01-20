#ifndef CUTIL_H
#define CUTIL_H

#include <cstring>
#include <thread>
#include <chrono>

#include "command.h"
#include <iostream>

using namespace std;

typedef std::map<std::string, std::string>Properties;

class CUtil
{

public:

    static Command Evaluate(std::string input) 
    {
        auto itr = Commands.find(input);
        return ((itr != Commands.end()) ? itr->second :InvalidCommand) ;
    }

    static Command GetCommand(Properties& properties)
    {
        std::string command = GetProperty(properties, "command");
        log("Processing command '" + command + "'") ;
        return Evaluate(command);
    }

    static std::string GetId(Properties& properties)
    {
        return GetProperty(properties, "id"); 
    }

    static std::string GetName(Properties& properties)
    {
        return GetProperty(properties, "channelName"); 
    }

    static void GetProperty(std::string& value, Properties& properties, std::string key)
    {
        value = GetProperty(properties, key).c_str();    
    }

    static void GetProperty(int& value, Properties& properties, std::string key)
    {
        value = atoi(GetProperty(properties, key, "0").c_str());    
    }
    
    static void GetProperty(long& value, Properties& properties, std::string key)
    {
        value = atol(GetProperty(properties, key, "0").c_str());    
    }
    
    static void GetProperty(double& value, Properties& properties, std::string key)
    {
        value = atof(GetProperty(properties, key, "0.0").c_str());    
    }
    
    static std::string GetProperty(Properties& properties, std::string key, std::string defalue="")
    {
        Properties::const_iterator it = properties.find(key);
        return ((it != properties.end()) ? it -> second : defalue);
    }

    static void log(Properties& properties, std::string msg)
    {
        std::cout << msg << " channel { id:"<< GetProperty(properties, "id")
            <<", name:"<<CUtil::GetProperty(properties, "channelName") 
            <<", group:"<<CUtil::GetProperty(properties, "channelGroup")<<" }" <<std::endl ;
    }

    static void log(std::string msg)
    {
        std::cout << msg <<std::endl ;
    }

    static void sleep(double seconds)
    {
        std::this_thread::sleep_for(std::chrono::milliseconds((int)(seconds*1000)));
    }

    static void sleep(Properties& properties)
    {
        sleep(atof(GetProperty(properties, "sleep", "0.0").c_str()));
    }
};

#endif // CUTIL_H

