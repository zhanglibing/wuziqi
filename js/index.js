$(function(){
    var canvas=$('#canvas').get(0);
    var ctx=canvas.getContext("2d");
    var ROW=15;
    var width=$(canvas).width();
    var off=width/ROW;
    // 创建一个对象用来存储所有落下的棋子的颜色以及所对应的位置
    var blocks={};
    var flag=true;
    var ai=false;
    var game=false;
    var huiqi=[];
    // 空白区域  AI判断用
    var blank={};
    // 将空白位置对应的位置设置为true用来为AI做判断
    for(var i=0;i<ROW;i++){
        for(var j=0;j<ROW;j++){
            blank[pq(i,j)]=true;
        }
    }
    // 棋子音效
    var audio=$('audio').get(0);
    // 清除浏览器默认动作
    $(document).on('mousedown',false)
    // 绘制表格函数
    function draw(){
        // 循环绘制线
        for(var i=0;i<15;i++){
            ctx.beginPath();
            //0.5是用来消除双像素线
            ctx.moveTo(off/2+0.5,(i+0.5)*off+0.5)
            ctx.lineTo((ROW-0.5)*off+0.5,(i+0.5)*off+0.5);
            ctx.moveTo((i+0.5)*off+0.5,off/2+0.5)
            ctx.lineTo((i+0.5)*off+0.5,(ROW-0.5)*off+0.5);
            ctx.stroke();
            ctx.closePath();
        }
        // 绘制基点函数
        function makeCircle(x,y){
        ctx.beginPath();
        ctx.arc(x*off,y*off,5,0,2*Math.PI)
        ctx.fill()
        ctx.closePath();
     }
        //棋盘五个基点
        (function(){
            makeCircle(3.5,3.5)
            makeCircle(11.5,3.5)
            makeCircle(7.5,7.5)
            makeCircle(3.5,11.5)
            makeCircle(11.5,11.5)
        })();
    };
    // 将对应位置的x，y转化为对应id名
    function pq(x,y){
         return x+"_"+y;
    }
    // 画棋子函数
    function drawChess(position,color){
        ctx.save();
        // 将中心点移动便于计算
        ctx.translate((position.x+0.5)*off+0.5,(position.y+0.5)*off+0.5);
        ctx.beginPath();
        ctx.arc(0,0,15,0,2*Math.PI);
        if(color=="black"){
            var img=new Image();
            img.src="images/hei1.png";
            ctx.drawImage(img,-15,-15,30,30)
        }else{
            var img=new Image();
            img.src="images/bai.png";
            ctx.drawImage(img,-15,-15,30,30)
        }
        ctx.closePath();
        ctx.restore()
        blocks[position.x+'_'+position.y]=color;
        // 落棋子后将对应的空白取消
        delete blank[position.x+'_'+position.y];
    }
   // 创建一个判断输赢的函数
    function check(position,color){
        var rowNum=1;
        var num2=1;
        var num3=1;
        var num4=1;
        var table={};
        for(var i in blocks){
            if(blocks[i]===color){
                table[i]=true;
            }
        }
        // 横向和竖直方向判断
        var tx=position.x;
        var ty=position.y;
        while(table[pq(tx+1,ty)]){
            rowNum++;tx++
        }
        while(table[pq(tx,ty+1)]){
            num2++;ty++;
        }
        var tx=position.x;
        var ty=position.y;
        while(table[pq(tx-1,ty)]){
            rowNum++;tx--;
        }
        while(table[pq(tx,ty-1)]){
            num2++;ty--;
        }
        // 斜向判断
        var tx=position.x;
        var ty=position.y;
        while(table[pq(tx+1,ty-1)]){
            num3++;tx++; ty--;
        }
        var tx=position.x;
        var ty=position.y;
        while(table[pq(tx-1,ty+1)]){
            num3++;tx--; ty++;
        }
        var tx=position.x;
        var ty=position.y;
        while(table[pq(tx+1,ty+1)]){
            num4++;tx++; ty++;
        }
        var tx=position.x;
        var ty=position.y;
        while(table[pq(tx-1,ty-1)]){
            num4++;tx--; ty--;

        }
        return Math.max(num2,rowNum,num3,num4);
    }

    function handerClick(e){
        if(game){
            var position={
                x:Math.round((e.offsetX-off/2)/off),
                y:Math.round((e.offsetY-off/2)/off)}
            if(blocks[position.x+"_"+position.y]){
                return;
            }
            if(ai){
                $('.xianxing').removeClass('active')
                drawChess(position,"black")
                huiqi.push(position.x+"_"+position.y);
                audio.play();
                if(check(position,"black")>=5){
                    $('.tishi').addClass('active');
                    $('.tishi .title').text('恭喜你！！!')
                    $('.tishi .font').text('你赢了！！!')
                    $(this).off('click')
                    $('.qi').detach();
                    return
                }
                drawChess(AI(),"white");
                huiqi.push(AI().x+"_"+AI().y);
                audio.play();
                $('.qi').detach();
                $('<div>').addClass('qi').appendTo('.guan')
                $('.qi').addClass('hei')
                if(check(AI(),"white")>=6){
                    $('.tishi').addClass('active');
                    $('.tishi .title').text('很遗憾！！!')
                    $('.tishi .font').text(' 你输了 真菜！！!')
                    $(this).off('click')
                    $('.qi').detach();
                    return;
                }
                return;
            }
            if(flag){
                drawChess(position,"black")
                audio.play();
                $('.qi').detach();
                $('<div>').addClass('qi').appendTo('.guan')
                $('.qi').addClass('bai')
                if(check(position,"black")>=5){
                    $('.qi').detach();
                    $('.tishi').addClass('active');
                    $('.tishi .title').text('恭喜你！！!')
                    $('.tishi .font').text('黑棋 你赢了！！!')
                    $(this).off('click')
                    return;
                }

            }else {
                drawChess(position,"white")
                audio.play();
                $('.qi').detach();
                $('<div>').addClass('qi').appendTo('.guan')
                $('.qi').addClass('hei')
                if(check(position,"white")>=5){
                    $('.qi').detach();
                    $('.tishi').addClass('active');
                    $('.tishi .title').text('恭喜你！！!')
                    $('.tishi .font').text('白棋 你赢了！！!')
                    $(this).off('click')
                    return;
                }

            }
            flag=!flag;
            huiqi.push(position.x+"_"+position.y);
        }else{
            return;
        }
    }
   // 画布中的点击事件
    $(canvas).on('click',handerClick)
    function k2o(pos){
       var arr=pos.split("_");
        return position={
            x:(parseInt(arr[0])+0.5)*off,
            y:(parseInt(arr[1])+0.5)*off
        }
    }
    //悔棋时用来转化
    function k2o1(pos){
        var arr=pos.split("_");
        return position={
            x:(parseInt(arr[0])),
            y:(parseInt(arr[1]))
        }
    }
   function kk(pos){
       var arr=pos.split("_");
       return position={
           x:parseInt(arr[0]),
           y:parseInt(arr[1])
       }
   }
   // 生成棋谱时写文本的函数
    function drawText(pos,text,color){
        ctx.save();
        ctx.font="20px sans-serif";
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        if(color=="black"){
            ctx.fillStyle="#fff"
        }else if(color=="white"){
            ctx.fillStyle="#000"
        }
        ctx.fillText(text,pos.x,pos.y);
        ctx.restore();
    }
    // 观看棋谱
    function review(){
        var i=1;
        for(var pos in blocks){
            drawText(k2o(pos),i,blocks[pos])
            i++;
        }
    }
    // AI判断
    function AI(){
        var max1=-Infinity;
        var max2=-Infinity;
        var pos1;
        var pos2;
        //遍历所有空白
        for(var i in blank){
            // 把自己当成黑旗
           // 为这个位置打分
           var score1= check(kk(i),"black")
           var score2= check(kk(i),"white");
            if(score1>max1){
                max1=score1;
                pos1=i;
            }
            if(score2>max2){
                max2=score2;
                pos2=i;
            }
        }
        if(max1>max2){
          return kk(pos1)
        }
        if(max2>=max1){
            return kk(pos2)
        }
    }
   
    //是否观看棋谱
    $('.guankan').on('click',function () {
        $('.tishi').removeClass('active');
        review()
    })

    //删除提示
    $('.tishi .delete').on('click',function(){
        $('.tishi').removeClass('active');
    })
    //再来一次
    $('.zailai').on('click',function(){
        $('.tishi').removeClass('active');
        $('.reset').triggerHandler('click')
    })
    //重新来时游戏
    $('.reset').on('click',function(){
        ctx.clearRect(0,0,width,width)
        $(canvas).off('click');
        $('.select').slideDown(500);
    })
    //开始游戏
    $('.start').on('click',function(){
        $('.select').slideDown(500);
        $('.guankan').addClass('active');
        $('.zailai').addClass('active');
        $('.tishi').removeClass('active');
    })

    //判断选择的游戏类型
    $(".select .renren input").on('click',function(){
        $('.select .renren input:checkbox').prop('checked',true)
        $('.select .renji input:checkbox').prop('checked',false)
    })
    $(".select  .renji input").on('click',function(){
        $('.select .renji input:checkbox').prop('checked',true)
        $('.select .renren input:checkbox').prop('checked',false)
    })
    $('.submit').on('click',function(){
        game=true;
        flag=true;
        ctx.clearRect(0,0,width,width)
        draw();
        blocks={};
        huiqi=[];
        $('.next').addClass('active')
        if($('.select .renji input:checked').length==0){
            ai=false;
            $('.wanjia2 span').text('玩家2')
        }else{
            ai=true;
            $('.wanjia2 span').text('电脑')
        }
        // $('.wanjia1').addClass('active')
        $(canvas).off('click').on('click',handerClick);
        $('.wanjia1').addClass('active');
         $('.select').slideUp();
    })
    //悔棋
    $('.huiqi').on('click',function(){
        blank[huiqi.length-1]=false;
        huiqi.pop();
        if(ai){
            blank[huiqi.length-1]=false;
            huiqi.pop();
        }else{
            flag=!flag;
        }
        var huibiao={};
        for(var i=0;i<huiqi.length;i++){
            huibiao[huiqi[i]]=blocks[huiqi[i]];
        }
        ctx.clearRect(0,0,width,width)
        draw();
        $(canvas).off('click').on('click',handerClick);
        blocks=huibiao;
        for(var j=0;j<huiqi.length;j++){
            drawChess(k2o1(huiqi[j]),blocks[huiqi[j]])
        }
    })
    //退出游戏
    $('.end').on('click',function(){
        game=false;
        ctx.clearRect(0,0,width,width)
        blocks={};
        $('.next').removeClass('active')
        $('.wanjia1').removeClass('active')
    })
    //游戏介绍
    $('.jieshao').on('click',function(){
        $('.content').slideToggle();
    })
 //刷新动画
 $('.menu').addClass('active')
 $('.guan').addClass('active')
    $('.tishi').addClass('active');
    $('.tishi .title').text('Welcome to here.')
    $('.tishi .font').text('欢迎来到五子棋的世界')
})