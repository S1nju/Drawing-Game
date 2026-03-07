<?php
// GENERATED CODE -- DO NOT EDIT!

namespace Game;

/**
 */
class GameServiceClient extends \Grpc\BaseStub {

    /**
     * @param string $hostname hostname
     * @param array $opts channel options
     * @param \Grpc\Channel $channel (optional) re-use channel object
     */
    public function __construct($hostname, $opts, $channel = null) {
        parent::__construct($hostname, $opts, $channel);
    }

    /**
     * @param \Game\CheckGameRequest $argument input argument
     * @param array $metadata metadata
     * @param array $options call options
     * @return \Grpc\UnaryCall<\Game\CheckGameResponse>
     */
    public function CheckGame(\Game\CheckGameRequest $argument,
      $metadata = [], $options = []) {
        return $this->_simpleRequest('/game.GameService/CheckGame',
        $argument,
        ['\Game\CheckGameResponse', 'decode'],
        $metadata, $options);
    }

    /**
     * @param \Game\GetGameRequest $argument input argument
     * @param array $metadata metadata
     * @param array $options call options
     * @return \Grpc\UnaryCall<\Game\GameInfoResponse>
     */
    public function GetGameInfo(\Game\GetGameRequest $argument,
      $metadata = [], $options = []) {
        return $this->_simpleRequest('/game.GameService/GetGameInfo',
        $argument,
        ['\Game\GameInfoResponse', 'decode'],
        $metadata, $options);
    }

}
