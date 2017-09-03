param($Port=18080, $HomePage='index.html', $DefaultPage=$HomePage)
$urlRoot = "http://localhost:$Port/"
$urlMain = $urlRoot+$HomePage
$parentPath = [IO.Path]::GetDirectoryName($MyInvocation.InvocationName)

$listener = New-Object Net.HttpListener
$listener.Prefixes.add($urlRoot)

try{
    "localhostで簡易httpサーバーを作動させます。"|oh
    try {
        $listener.Start()
    } finally {
        #起動ついでにブラウザで開いてやる
        #Start()に失敗するケースでも既にHttpサーバーが動いているケースを期待してURLは開く
        "$urlMain を開きます。"|oh
        start $urlMain
    }

    $running = $true
    while($running){
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        ($url = $request.RawUrl)|oh
        $path = $url.TrimStart('/').split("?")[0]
        if(!$path) {
            "def:"+$DefaultPage|oh
            $path = $DefaultPage
        }

        $fullPath = [IO.Path]::Combine($parentPath, $path)
        $content = [byte[]]@()
        if( [IO.File]::Exists($fullPath) ){
            $content = [IO.File]::ReadAllBytes($fullPath)
        } else {
            $response.StatusCode = 404
        }

        $response.OutputStream.Write($content, 0, $content.Length)
        $response.Close()
    }
} finally {
    #スクリプトではあまり真面目にリソース管理しようとは思わないけれども一応
    $listener.Dispose()
}
'終了します。'|oh
pause