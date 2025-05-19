<?php

namespace App\Event;

use App\Entity\Client;
use Symfony\Contracts\EventDispatcher\Event;


class ClientCreatedEvent extends Event
{
    public const string NAME = 'app.client.created';

    private Client $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function getUser(): Client
    {
        return $this->client;
    }
}
