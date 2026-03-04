<?php
// GENERATED CODE -- DO NOT EDIT!

namespace ;

/**
 */
class UsersServiceClient extends \Grpc\BaseStub {

    /**
     * @param string $hostname hostname
     * @param array $opts channel options
     * @param \Grpc\Channel $channel (optional) re-use channel object
     */
    public function __construct($hostname, $opts, $channel = null) {
        parent::__construct($hostname, $opts, $channel);
    }

    /**
     * @param \CheckUserRequest $argument input argument
     * @param array $metadata metadata
     * @param array $options call options
     * @return \Grpc\UnaryCall
     */
    public function CheckUser(\CheckUserRequest $argument,
      $metadata = [], $options = []) {
        return $this->_simpleRequest('/UsersService/CheckUser',
        $argument,
        ['\CheckUserResponse', 'decode'],
        $metadata, $options);
    }

    /**
     * @param \CheckByIdRequest $argument input argument
     * @param array $metadata metadata
     * @param array $options call options
     * @return \Grpc\UnaryCall
     */
    public function CheckById(\CheckByIdRequest $argument,
      $metadata = [], $options = []) {
        return $this->_simpleRequest('/UsersService/CheckById',
        $argument,
        ['\CheckByIdResponse', 'decode'],
        $metadata, $options);
    }

}
