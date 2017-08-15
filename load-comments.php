<?php 
$id = $_POST['id'];
$json = file_get_contents('http://www.buzzfeed.com/api/v1/comments/' . $id);
$obj = json_decode($json);
$count = sizeof( $obj->{'comments'} );
$count = $obj->{'total_count'} / $count;
$comments = array();
if( $_POST['total'] ):
	$total = $_POST['total'];
	$pageNum = $_POST['pageNum'];
	$total = $total + $pageNum;
	if( $total >= $count ) {
		$total = $count;
	}
	for( $i = $pageNum; $i < $total; $i++ ) {
		$p = $i + 1;
		$json = file_get_contents('http://www.buzzfeed.com/api/v1/comments/' . $id . '?p=' . $p);
		$obj = json_decode($json);
		$comments[$p] = $obj;
	}
	echo json_encode($comments);
else :
	echo '1';
endif;

