<?php

namespace App\Entity;

use App\Repository\ClientRepository;
use App\Trait\TimeStampTrait;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ClientRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[UniqueEntity(fields: ['email'], message: 'There is already an account with this email')]
class Client implements UserInterface, PasswordAuthenticatedUserInterface
{
    use TimeStampTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['client:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client:read'])]
    private ?string $firstname = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client:read'])]
    private ?string $lastname = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['client:read'])]
    private ?\DateTime $birth = null;

    #[ORM\Column(length: 255)]
    #[Groups(['client:read'])]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    #[Groups(['client:read'])]
    private ?string $phone = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    #[Groups(['client:read'])]
    private ?string $zipcode = null;

    #[ORM\Column(type: Types::STRING, length: 255, nullable: true)]
    #[Groups(['client:read'])]
    private ?string $address = null;

    #[ORM\Column(length: 255)]
    #[Groups(['client:read'])]
    private ?string $city = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client:read'])]
    private ?string $gender = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['client:read'])]
    private ?string $societyName = null;

    #[ORM\Column(type: Types::BOOLEAN, nullable: true)]
    #[Groups(['client:read'])]
    private ?bool $verifiedAccount = null;

    #[ORM\Column(type: Types::STRING, length: 255, nullable: true)]
    private ?string $verificationToken = null;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(['client:read'])]
    private ?float $longitude = null;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(['client:read'])]
    private ?float $latitude = null;

    #[ORM\Column(type: Types::STRING, nullable: true)]
    #[Groups(['client:read'])]
    private ?string $hash = null;

    #[ORM\Column(type: Types::STRING, nullable: true)]
    #[Groups(['client:read'])]
    private ?string $avatar = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(?string $firstname): static
    {
        $this->firstname = $firstname;
        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }


    public function setLastname(?string $lastname): static
    {
        $this->lastname = $lastname;
        return $this;
    }

    public function getBirth(): ?\DateTime
    {
        return $this->birth;
    }

    public function setBirth(?\DateTime $birth): static
    {
        $this->birth = $birth;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getZipcode(): ?string
    {
        return $this->zipcode;
    }

    public function setZipcode(string $zipcode): static
    {
        $this->zipcode = $zipcode;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getSocietyName(): ?string
    {
        return $this->societyName;
    }

    public function setSocietyName(?string $societyName = null): static
    {
        $this->societyName = $societyName;

        return $this;
    }

    public function getGender(): ?string
    {
        return $this->gender;
    }

    public function setGender(?string $gender = null): static
    {
        $this->gender = $gender;

        return $this;
    }

    public function isVerifiedAccount(): ?bool
    {
        return $this->verifiedAccount;
    }

    public function setVerifiedAccount(?bool $verifiedAccount = null): static
    {
        $this->verifiedAccount = $verifiedAccount;

        return $this;
    }

    public function getVerificationToken(): ?string
    {
        return $this->verificationToken;
    }

    public function setVerificationToken(?string $verificationToken = null): static
    {
        $this->verificationToken = $verificationToken;

        return $this;
    }

    public function getLongitude(): ?float
    {
        return $this->longitude;
    }

    public function setLongitude(?float $longitude = null): static
    {
        $this->longitude = $longitude;

        return $this;
    }

    public function getLatitude(): ?float
    {
        return $this->latitude;
    }

    public function setLatitude(?float $latitude = null): static
    {
        $this->latitude = $latitude;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address = null): static
    {
        $this->address = $address;

        return $this;
    }

    public function getHash(): ?string
    {
        return $this->hash ?? hash('sha256', $this->getFirstname() . $this->getLastname() . $this->getEmail() . $this->getPhone());
    }

    public function setHash(?string $hash = null): static
    {
        $this->hash = $hash;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar = null): static
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function __toString(): string
    {
        return $this->firstname . ' ' . $this->lastname;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    public function eraseCredentials(): void
    {
        // Efface les données sensibles temporaires (ex: mot de passe en clair)
    }
}