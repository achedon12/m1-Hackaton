<?php

namespace App\Event;

use App\Entity\Bill;
use Symfony\Contracts\EventDispatcher\Event;


class BillCreatedEvent extends Event
{
    public const string NAME = 'app.bill.created';

    private Bill $bill;

    public function __construct(Bill $quotation)
    {
        $this->bill = $quotation;
    }

    public function getBill(): Bill
    {
        return $this->bill;
    }
}
