<?PHP


//to help debug error handling
  // header('HTTP/1.0 404 Not Found');
  //   echo "<h1>404 Not Found</h1>";
  //   echo "The page that you have requested could not be found.";
  //   exit();



$valid_url_regex = '/.*/';

//header('Access-Control-Allow-Origin: *');
//header('Access-Control-Allow-Methods:POST');  

// ############################################################################

$url = $_GET['url'];

if ( !$url ) {
  
  // Passed url not specified.
  $contents = 'ERROR: url not specified';
  $status = array( 'http_code' => 'ERROR' );
  
} else if ( !preg_match( $valid_url_regex, $url ) ) {
  
  // Passed url doesn't match $valid_url_regex.
  $contents = 'ERROR: invalid url';
  $status = array( 'http_code' => 'ERROR' );
  
} else {
  // $url = "http://www.reddit.com/" . $url;
  //$url = "http://api.reddit.com/" . $url;
  $qryParams = str_replace("url=". $url,  '', $_SERVER['QUERY_STRING']);
  $qryParams = ltrim($qryParams, '&');
  $url = "http://api.reddit.com/" . $url . '?'. $qryParams;
  $ch = curl_init( $url );

   //echo $url;
   //parse_str($_GET['QUERY_STRING'], $output);
   //echo $output;
 // echo $_SERVER['QUERY_STRING'];
  // exit;
  
  if ( strtolower($_SERVER['REQUEST_METHOD']) == 'post' ) {
    curl_setopt( $ch, CURLOPT_POST, true );
    curl_setopt( $ch, CURLOPT_POSTFIELDS, $_POST );
  }
  
//always send cookies
 //   $cookie = array();
 //   foreach ( $_COOKIE as $key => $value ) {
 //     $cookie[] = $key . '=' . $value;
 //   }

   // $cookie[] = SID;
//    $cookie = implode( '; ', $cookie );   
 //   curl_setopt( $ch, CURLOPT_COOKIE, $cookie );
  

  if(isset($_GET['cookie']))
  {
      $cookie = $_GET['cookie'];
	curl_setopt($ch, CURLOPT_COOKIE, "reddit_session=$cookie");
  }
  
  
  curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
  curl_setopt( $ch, CURLOPT_HEADER, false );
  curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
  curl_setopt($ch,CURLOPT_USERAGENT,"redditjs/1.0 by /u/armastevs");
 // curl_setopt( $ch, CURLOPT_USERAGENT, $_GET['user_agent'] ? $_GET['user_agent'] : $_SERVER['HTTP_USER_AGENT'] );
  
 // list( $header, $contents ) = preg_split( '/([\r\n][\r\n])\\1/', curl_exec( $ch ), 2 );
 $contents =  curl_exec( $ch );

  
  curl_close( $ch );
}

// Split header text into an array.
//$header_text = preg_split( '/[\r\n]+/', $header );


  
  // Propagate headers to response.
  //foreach ( $header_text as $header ) {
  //  if ( preg_match( '/^(?:Content-Type|Content-Language|Set-Cookie):/i', $header ) ) {
  //    header( $header );
  //  }
 // }
  
  print $contents;


?>