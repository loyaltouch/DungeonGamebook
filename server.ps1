param($Port=18080, $HomePage='index.html', $DefaultPage=$HomePage)
$urlRoot = "http://localhost:$Port/"
$urlMain = $urlRoot+$HomePage
$parentPath = [IO.Path]::GetDirectoryName($MyInvocation.InvocationName)

$listener = New-Object Net.HttpListener
$listener.Prefixes.add($urlRoot)

try{
    "localhost�ŊȈ�http�T�[�o�[���쓮�����܂��B"|oh
    try {
        $listener.Start()
    } finally {
        #�N�����łɃu���E�U�ŊJ���Ă��
        #Start()�Ɏ��s����P�[�X�ł�����Http�T�[�o�[�������Ă���P�[�X�����҂���URL�͊J��
        "$urlMain ���J���܂��B"|oh
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
    #�X�N���v�g�ł͂��܂�^�ʖڂɃ��\�[�X�Ǘ����悤�Ƃ͎v��Ȃ�����ǂ��ꉞ
    $listener.Dispose()
}
'�I�����܂��B'|oh
pause