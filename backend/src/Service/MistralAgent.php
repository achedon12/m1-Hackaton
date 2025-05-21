<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use App\Repository\OperationRepository;

class MistralAgent
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private OperationRepository $operationRepository,
    ) {}

    public function analyzeMessage(string $clientMessage): array
    {
        $mistralApiKey = $_ENV['MISTRAL_API_KEY'];
        $operations = $this->operationRepository->findAll();

        $simplifiedOps = array_map(function($op) {
            return [
                'id' => $op->getId(),
                'libelle' => $op->getLibelle(),
                'help' => $op->getHelp(),
                'category' => [
                    'name' => $op->getCategory()?->getName()
                ]
            ];
        }, $operations);

        $operationsDescription = "";
        foreach ($simplifiedOps as $op) {
            $operationsDescription .= "{$op['id']}. {$op['libelle']}";
            if (!empty($op['help'])) {
                $operationsDescription .= " : {$op['help']}";
            }
            $operationsDescription .= "\n";
        }

        $systemMessage = "Tu es un assistant expert en mécanique automobile.";
        $userMessage = <<<EOT
Voici la liste des opérations disponibles : 
$operationsDescription

Le client dit : "$clientMessage"

Retourne uniquement les IDs des opérations pertinentes sous forme de tableau JSON.
EOT;

        $mistralApiUrl = 'https://api.mistral.ai/v1/chat/completions';

        $response = $this->httpClient->request('POST', $mistralApiUrl, [
            'headers' => [
                'Authorization' => "Bearer {$mistralApiKey}",
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => 'mistral-medium', // ou 'mistral-large' || 'mistral-large-latest' || 'mistral-medium' si besoin
                'messages' => [
                    ['role' => 'system', 'content' => $systemMessage],
                    ['role' => 'user', 'content' => $userMessage],
                ],
                'max_tokens' => 100,
            ],
        ]);

        $content = $response->getContent();
        $result = json_decode($content, true);
        $answer = $result['choices'][0]['message']['content'] ?? '';

        $cleaned = trim($answer);
        $cleaned = preg_replace('/^```json\s*/', '', $cleaned);
        $cleaned = preg_replace('/```$/', '', $cleaned);
        $cleaned = trim($cleaned);

        $ids = json_decode($cleaned, true);
        if (!is_array($ids)) {
            return [];
        }

        return array_filter($simplifiedOps, fn($op) => in_array($op['id'], $ids));
    }
}