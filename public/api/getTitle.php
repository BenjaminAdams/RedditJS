<?php

//this is for the suggest a title feature on the submit page

function get_url_contents($url){
        $crl = curl_init();
        $timeout = 5;
        curl_setopt ($crl, CURLOPT_URL,$url);
        curl_setopt ($crl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt ($crl, CURLOPT_CONNECTTIMEOUT, $timeout);
        $ret = curl_exec($crl);
        curl_close($crl);
        return $ret;
}

header('Content-Type: text/html; charset=utf-8'); // needed to display the right encoding

echo get_url_contents($_GET['url']);
//echo file_get_contents('http://example.com');