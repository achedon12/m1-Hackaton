<?php

namespace App\Entity;

use App\Repository\QuotationStateRepository;
use App\Trait\TimeStampTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: QuotationStateRepository::class)]
class QuotationState
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['quotationState:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['quotationState:read'])]
    private ?string $name = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }
}
