<?php
// GENERATED CODE -- DO NOT EDIT!

namespace App\Grpc;

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
     * @param \App\Grpc\CheckUserRequest $argument input argument
     * @param array $metadata metadata
     * @param array $options call options
     * @return \Grpc\UnaryCall<\App\Grpc\CheckUserResponse>
     */
    public function CheckUser(\App\Grpc\CheckUserRequest $argument,
      $metadata = [], $options = []) {
        return $this->_simpleRequest('/users.UsersService/CheckUser',
        $argument,
        ['\App\Grpc\CheckUserResponse', 'decode'],
        $metadata, $options);
    }

    /**
     * @param \App\Grpc\CheckByIdRequest $argument input argument
     * @param array $metadata metadata
     * @param array $options call options
     * @return \Grpc\UnaryCall<\App\Grpc\CheckByIdResponse>
     */
    public function CheckById(\App\Grpc\CheckByIdRequest $argument,
      $metadata = [], $options = []) {
        return $this->_simpleRequest('/users.UsersService/CheckById',
        $argument,
        ['\App\Grpc\CheckByIdResponse', 'decode'],
        $metadata, $options);
    }

}
