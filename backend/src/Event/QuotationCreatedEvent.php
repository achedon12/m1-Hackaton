<?php

namespace App\Event;

use App\Entity\Client;
use App\Entity\Quotation;
use Symfony\Contracts\EventDispatcher\Event;


class QuotationCreatedEvent extends Event
{
    public const string NAME = 'app.quotation.created';

    private Quotation $quotation;

    public function __construct(Quotation $quotation)
    {
        $this->quotation = $quotation;
    }

    public function getQuotation(): Quotation
    {
        return $this->quotation;
    }
}
