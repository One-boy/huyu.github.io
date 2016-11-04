


//核心方块

var Rect = function(){
    this.x1 = 5*pixelRatio; //背景距离两边的距离
    this.x2 = 5*pixelRatio; //相邻小方块的间隔
    this.width = 0;  //小方块的宽
    this.backStartX = 5; //背景起点x坐标
    this.backStartY = ch * 0.25; //背景起点y坐标
    this.ratio = 0.5; //生成2的比例
    this.rectData = []; //存储小方块

    this.data = []; //移动方块用

    this.numSize = 40 * pixelRatio; //方块内数字大小
    this.isMoved = true; //记录一帧是否移动过，没移动过，就不产生新的小方块
}

Rect.prototype.num = 3; //有多少行和列,4x4

Rect.prototype.init = function(){
    this.drawBack();
    //计算小方块的宽度
    this.width = ((cw-2*this.x1)-(this.num-1)*this.x2)/this.num;
    //数据初始化
    for(var i = 0; i < this.num; i++){
        for(var j = 0; j < this.num; j++){
            var x = this.backStartX+j*this.width+j*this.x2;
            var y = this.backStartY+i*this.width+i*this.x2;

            var obj = {
                x:x, //坐标
                y:y,
                tx:x+this.width/2, //显示文字的坐标
                ty:y+this.width/2,
                color:"#9E9E9E", //背景色
                num:0, //显示数字
                animation:false, //是否出场动画
            }
            this.rectData.push(obj);
        }
        
    }
    //生成两个随机
    this.random();
    this.random();
    this.drawSmallRect();
}

//背景
Rect.prototype.drawBack = function(color){

    var x = this.backStartX;
    var y = this.backStartY;
    var w = cw-2*this.x1;
    var h = w;

    this.drawRect(x,y,w,h,color || "#797676")
}
//画中间小方块
Rect.prototype.drawSmallRect = function(){
    for(var i = 0; i < this.rectData.length; i++){
        var obj = this.rectData[i];
        //判断是否应该画出数字
        if (obj.num != 0){
            
            this.drawRect(obj.x,obj.y,this.width,this.width,obj.color)
            
            ctx.save();
            ctx.textAlign = "center";  //水平对齐
            ctx.textBaseline = "middle";  //垂直对齐方式
            ctx.font = "bold "+this.numSize+"px sans-serif";
            ctx.fillStyle = "white";
            ctx.fillText(obj.num,obj.tx,obj.ty,this.width);
            ctx.restore();
        }else{
            this.drawRect(obj.x,obj.y,this.width,this.width,"#cacaca")
        }
        
    }

    //
    this.isMoved = false;
}
//随机生产2或4中的一个
Rect.prototype.random = function(){
        if (this.isMoved){
            var surplus = this.getSurplus();
        
            var flag = Math.floor(Math.random()*surplus+1); //在可用方块中哪里生成
            this.setRect(flag);
        }
        
    
}
//判断满盘时是否是死局
Rect.prototype.judgeDead = function(){
    for(var i = 0; i < this.num*this.num; i++){
        //只需要有一个相邻的数字相同，就不是死局
        //上方
        if (i-this.num >= 0){
            if (this.rectData[i-this.num].num == this.rectData[i].num) return false;
        }
        //右方
        if (( i % this.num + 1) < this.num){
            if (this.rectData[i+1].num == this.rectData[i].num) return false;
        }
        //下方
        if ((i + this.num) < this.num*this.num){
            if (this.rectData[i+this.num].num == this.rectData[i].num) return false;
        }
        //左方
        if (( i % this.num - 1) >= 0){
            if (this.rectData[i-1].num == this.rectData[i].num) return false;
        }
    }
    return true;
}
//设置生成的那个
Rect.prototype.setRect = function(flag){
    var count = 0;
    var num = Math.random() < 0.5 ? 2 : 4;  //产生2或2
    var colorRandom =num*200;
    for(var i = 0; i < this.rectData.length; i++){
        if (this.rectData[i].num == 0){
            count++;
            if (count == flag){
                this.rectData[i].num = num;
                this.rectData[i].color = "rgb("+colorRandom%255+","+colorRandom%255+","+colorRandom%255+")";
                this.rectData[i].animation = true;
            }
        }
    }
}
//剩余可用填充方块个数
Rect.prototype.getSurplus = function(){
    var num = 0;
    for(var i = 0; i < this.rectData.length; i++){
        if (this.rectData[i].num == 0){
            num++;
        }
    }
    return num;
}
//通用画方块方法
Rect.prototype.drawRect = function(x,y,width,height,color){
    ctx.save()
    ctx.fillStyle = color;
    ctx.fillRect(x,y,width,height);
    ctx.restore()
}

//方块的移动和组合
Rect.prototype.move = function(){
  
    //起始下标
    var startFlag = 0;
    //同一组步进值
    var sameNum = 0;
    //下一组步进值
    var nextNum = 0;
    
    var direction = eventObj.getDirection();

    if (direction == "up"){
        startFlag = 0;
        nextNum = 1;
        sameNum = this.num;
    }else if(direction == "down"){
        startFlag = this.num*this.num-1;
        nextNum = -1;
        sameNum = -this.num;
    }else if(direction == "left"){
        startFlag = 0;
        nextNum = this.num;
        sameNum = 1;
    }else if(direction == "right"){
        startFlag = this.num*this.num-1;
        nextNum = -this.num;
        sameNum = -1;
    }else{
        return;
    }
  
    for(var i = 0; i < this.num; i++){
        var tmp = startFlag;
        for(var j = 0; j < this.num; j++){
            this.data.push(tmp);
            tmp += sameNum;
        }
        //处理
        this.handle();
        startFlag += nextNum;
    }
}

//处理一行方块,相邻的相加
Rect.prototype.handle = function(){
    var isAdd = false; //是否已经组合过，一行只能相加一次
    for(var i = 0; i < this.data.length; i++){
        if (this.rectData[this.data[i]].num == 0){
            continue;
        }
        var j = i;
        while(j > 0){
            if (this.rectData[this.data[j-1]].num == 0){
                this.rectData[this.data[j-1]].num = this.rectData[this.data[j]].num;
                this.rectData[this.data[j-1]].color = this.rectData[this.data[j]].color;
                this.rectData[this.data[j]].num = 0;
                this.isMoved = true; //记录移动
            }else if(this.rectData[this.data[j]].num == this.rectData[this.data[j-1]].num){
                if (!isAdd){
                    this.rectData[this.data[j-1]].num = this.rectData[this.data[j]].num*2;
                    this.rectData[this.data[j]].num = 0;
                    data.score += this.rectData[this.data[j-1]].num;
                    isAdd = true;
                    this.isMoved = true; //记录移动
                }
                
            }else if(this.rectData[this.data[j]].num != this.rectData[this.data[j-1]].num){
                break;
            }
            j--;
        }
    }

    this.data = [];
}