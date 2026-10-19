<?php
$file = 'C:\Users\HP\Downloads\mboro-market\Cahier_des_charges_JendCiThies_SenECarte.pdf';
$content = file_get_contents($file);

// Rechercher les occurrences de "stream" et "endstream" pour identifier les chunks compressés
$chunks = [];
$lines = explode("\n", $content);
$inStream = false;
$currentChunk = "";

foreach ($lines as $line) {
    if (strpos($line, 'stream') !== false) {
        $inStream = true;
        $currentChunk = "";
        continue;
    }
    if ($inStream && strpos($line, 'endstream') !== false) {
        $inStream = false;
        // On a fini de lire le stream
        continue;
    }
    if ($inStream) {
        $currentChunk .= $line . "\n";
    }
}

// Sauvegarder les chunks trouvés
file_put_contents('C:\Users\HP\Downloads\mboro-market\chunks.txt', $currentChunk);
echo "Chunks extraits: " . strlen($currentChunk) . " octets\n";

// Essayer de décompresser le premier chunk (zlib/deflate)
// Le PDF utilise zlib avec 2 octets d'en-tête (0x78 0x9C ou 0x78 0xDA)
$firstChunk = $currentChunk;
echo "Premier chunk: " . strlen($firstChunk) . " octets de texte brut\n";

// Essayer de décompresser
$unpacked = zlib_decode($firstChunk);
if ($unpacked !== false) {
    echo "Décompressé avec succès!\n";
    file_put_contents('C:\Users\HP\Downloads\mboro-market\decrypted.txt', $unpacked);
} else {
    echo "Échec de la décompression\n";
}
