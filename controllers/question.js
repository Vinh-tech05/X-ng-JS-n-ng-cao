import {getQuizById,getQuestionsByIdQuiz} from '../services/api.js'
var listQuestion=[];
var listAnswerSubmit =[];
const btnSubmit = document.getElementById('btn_submit');
var isSumit = false;

const app ={
    getQuizandQuestion: async function(){

        // 1. Lấy id trên url http://127.0.0.1:5501/question.html?id=abcd
        const searchParam = new URLSearchParams(window.location.search);

        // console.log(searchParam);
        if(searchParam.has('id')){
            const id = searchParam.get('id');
            // console.log(id);
            // Phần 1: thông tin quiz
            // 2. Lấy dữ liệu Quiz theo id của quiz
            const dataQuiz = await getQuizById(id);
            console.log(dataQuiz);
            //2.1 Đếm ngược thời gian
            this.countDown(dataQuiz.time);

            // console.log(dataQuiz);

            // 3. Hiển thị thông tin quiz qua giao diện
            this.renderQuizInfo(dataQuiz);

            // ===================================

            // Phần 2: Thông tin question:
            listQuestion = await getQuestionsByIdQuiz(id);
            this.renderListQuestion(listQuestion);
        }

    },
    renderQuizInfo: function(data){
        document.getElementById('quiz_heading').innerHTML = data.title;
        document.getElementById('quiz_description').innerHTML = data.description;

    },
    renderListQuestion: function(list){
        // 1. tráo câu hỏi
        list = this.random(list);
        // 2. duyệt qua mảng câu hỏi
        const questionItem = list?.map((item,index)=>{
            // render các câu trả lời
            const listAnswers = this.renderAnswers(item.answers,item.type,item.id);
            // console.log(listAnswers);
            // 3. Thay đổi nội dung câu hỏi
            return `
                <div class="question_item border border-2 rounded p-4 mb-2">
                    <h4 class="question_number" id="${item.id}">Câu hỏi: ${index+1}</h4>
                    <h5 class="question_title" >
                       ${item.questionTiltle}
                    </h5>
                    <div class="answer_items mt-3">
                       ${listAnswers}
                    </div>
                </div>
            `
        }).join("");

        document.getElementById('question_container').innerHTML = questionItem
        
    },
    renderAnswers: function(listAnswers,type,idQuestion){
        //listAnswers: danh sách câu trả lời
        // type: kiểu câu hỏi 1: radio, 2: checkbox
        //idQuestion: id của câu hỏi

        // 1. tráo câu trả lời
        listAnswers= this.random(listAnswers);
        // 2. duyệt qua mảng câu trả lời
        return listAnswers?.map((ans,index)=>{
            return `
                <div class="form-check fs-5 mb-3">
                    <input class="form-check-input border border-2 border-primary" role="button" 
                        type="${type == 1 ? 'radio': 'checkbox'}" 
                        name="question_${idQuestion}" 
                        id="answer_${idQuestion}_${ans.id}"
                        data-idquestion="${idQuestion}"
                        data-idanswer="${ans.id}" >

                    <label class="form-check-label" role="button" for="answer_${idQuestion}_${ans.id}" >
                        ${ans.answerTitle}
                    </label>
                </div>
            `
        }).join("")
    },
    random: function(array){
        return array.sort(()=>{
            return Math.random() - Math.random();
        })
    },
    handleSubmit : function(){
        btnSubmit.addEventListener('click',()=>{
            if(confirm("Bạn có chắc chắn nộp bài không?")){
                isSumit= true;
                // 0. disabe nút input (Người dùng không thể thay đổi đáp khi đã submit)
                this.handleSubmitForm()
            }
            
        })
    },

    handleSubmitForm : function(){
        const inputAll = document.querySelectorAll('input');
        inputAll.forEach((item)=>{
            // hủy hành vi mặc định của sự kiện
            item.addEventListener('click',(e)=>{

                e.preventDefault()
            })

        })

        // I. Lấy đáp án mà người lựa chọn
        // 1. lấy tất cả câu trả lời theo từng câu hỏi
        const listAnswersUser = document.querySelectorAll('.answer_items');
        // console.log(listAnswersUser);
        // 2. duyệt qua từng nhóm câu trả lời
        
        listAnswersUser?.forEach((answers)=>{
            // console.log({answers});
            const data ={
                idQuestion: '',
                idAnswers: []
            }
            const inputs = answers.querySelectorAll('input');

            //3. duyệt mảng các câu trả lời
            inputs?.forEach((ans)=>{
                if(ans.checked){
                    // console.log(ans);
                    // console.log("dataset:"+ans.dataset.idquestion);
                    // console.log("getAttribute:"+ans.getAttribute('data-idquestion'));
                    data.idQuestion = ans.dataset.idquestion;
                    data.idAnswers.push(ans.dataset.idanswer)
                }
            })

            if(data.idAnswers && data.idAnswers.length)
                listAnswerSubmit.push(data)
        })
        // console.log(listAnswerSubmit);
        // Kiểm tra đáp xem có chính xác không
        this.checkAnswers(listAnswerSubmit)
    },
    checkAnswers: function(listAnswerSubmit){
        // 1. Lưu trữ kết quả kiểm tra
        const checkResult=[];
        // console.log(listAnswerSubmit);
        console.log(listQuestion); // danh sách câu hỏi từ getQuizandQuestion
        
        // 2. duyệt qua các đáp án mà người dùng lựa chọn
        const listStatus = [];
        let countRight =0;

        listAnswerSubmit.forEach((ansUser)=>{
            // ansUser
            // console.log(ansUser);
            // 2.1 tìm câu hỏi có đáp án trong mảng listQuestion(lấy từ db)
            const findQuestion = listQuestion.find((ques)=> {return ques.id == ansUser.idQuestion})
            // console.log(findQuestion);
            // 2.2 so sánh giá trị của 2 mảng
            //  ansUser.idAnswers: danh sách đáp của user (mảng)
            // findQuestion.correctAnser: đáp án chính xác lấy từ db (mảng)
            const isCheck = this.checkEqual(ansUser.idAnswers,findQuestion.correctAnser);
            // 2.3 Lưu trữ trạng thái đúng/sai của câu hỏi

            if(isCheck){
                // nếu đúng tăng count lên 1
                countRight++
            }
            // lưu trữ trạng thái đúng hoặc sai của câu hỏi đã trả lời
            listStatus.push({
                idQuestion: findQuestion.id,
                status: isCheck
            })
        })
        // hiên thị trạng thaid đúng hoặc sai của câu hỏi đã trả lời
        this.renderStatus(listStatus);
        // thông báo
        alert(`Ban tra loi dung ${countRight}/${listQuestion.length}`)
        // console.log(listStatus);

    },
    checkEqual: function(arr1,arr2){
        // kiểm tra xem 2 mảng có bằng nhau hay không
        //1. kiểm tra độ dài của 2 mảng
        if( arr1.length != arr2.length)
            return false

        // 2. kiểm tra giá trị
        // arr1 = [1,2,3]
        // arr2 = [1,2,3]
        // 2.1 xắp xếp thứ tự 2 mảng tăng hoặc giảm dần
        arr1 = arr1.sort();
        arr2 = arr2.sort();
        // console.log(arr1);
        // console.log(arr2);
        // 2.2 check đáp án
        for(var i =0; i< arr1.length;i++){
            if(arr1[i] != arr2[i]){
                return false
            }
        }
        // nêu độ dài bằng nhau và đáp án giống nhau
        return true;
    },
    renderStatus: function(listStatus){
        listStatus.forEach((item)=>{
            const title = document.getElementById(item.idQuestion);
            title.innerHTML = `${title.textContent} ${item.status ? `<span class="badge text-bg-success">Đúng</span>`: `<span class="badge text-bg-danger">Sai</span>`}`
        })
    },
    countDown: function(time){ // giây
        //1. tính toán đổi giây -> phút:giây
        const that = this;

        function handleTime (){
            const minute = Math.floor(time/60);
            // console.log(minute);
        
            const second = time%60;
            // console.log(second);
            //2. lấy id"timer"
            const timeElement = document.getElementById('timer');
    
            timeElement.innerHTML = `
            ${minute < 10 ? '0': ''}${minute}
            :
            ${second < 10 ? '0': ''}${second}`

            // giảm thời gian sau 1s
            time--;
            if(isSumit){
                clearInterval(timeInter);
            }

            if(time < 0){
                //submit bài làm
                // btnSubmit.click();
                that.handleSubmitForm();
                clearInterval(timeInter);
                timeElement.innerHTML = `Hết thời gian`
            }

        }

        const timeInter = setInterval(handleTime,1000);

    },
    reset: function(){
        const btnReset = document.getElementById("btn_reset");
        btnReset.addEventListener("click",()=>{
            if(window.confirm("Bạn có muốn làm lại không ?")){
                //tải trang
                window.location.reload();
            }
        })
    },
    start: function(){
        this.getQuizandQuestion();
        this.handleSubmit();
        this.reset();
    }
}

app.start();