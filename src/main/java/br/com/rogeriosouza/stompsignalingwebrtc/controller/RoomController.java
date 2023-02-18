package br.com.rogeriosouza.stompsignalingwebrtc.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
public class RoomController {

    private static final Logger LOGGER = LoggerFactory.getLogger(RoomController.class);

    @MessageMapping("/room/{room}/webrtc")
    public String salaWebRtc(@DestinationVariable String room, @Payload Message<String> msg) {
        LOGGER.debug(msg.getPayload());
        return msg.getPayload();
    }

    @MessageMapping("/room/{room}")
    public String sala(@DestinationVariable String room,  @Payload Message<String> msg) {
        LOGGER.info(msg.getPayload());
        return msg.getPayload();
    }

}
