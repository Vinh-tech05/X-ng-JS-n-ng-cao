import {addQuestions} from '../services/api.js'
const app ={
    renderQuestion: function(){
        // 1 . lấy độ dài của mảng 
        const currentQuestion = document.querySelectorAll('.question_item')?.length + 1 || 1;

        // 2. thêm mới dữ liệu question
        const listQuestion = document.getElementById('list_question');

        const divElement = document.createElement('div');
        divElement.classList = 'question_item border border-2 rounded p-4 mb-2';
        divElement.innerHTML =`
            <h4 class="question_number">Câu hỏi: ${currentQuestion}</h4>
            <div class="mb-3">
                <label for="question_${currentQuestion}" class="form-label">Nội dung câu hỏi</label>
                <textarea class="form-control" id="question_content_${currentQuestion}" rows="3"></textarea>
              </div>
            <div class="answer_items mt-3">
                <div class="form-check fs-5 mb-3" >
                    <input class="form-check-input border border-2 border-primary" role="button" type="radio" name="question_${currentQuestion}" id="check_${currentQuestion}_1" >
                    <div class="mb-3">
                        <input type="text" class="form-control" id="answer_${currentQuestion}_1" placeholder="Nhập nội dung đáp 1">
                    </div>
                </div>

                <div class="form-check fs-5 mb-3">
                    <input class="form-check-input border border-2 border-primary" role="button" type="radio" name="question_${currentQuestion}" id="check_${currentQuestion}_2" >
                    <div class="mb-3">
                        <input type="text" class="form-control" id="answer_${currentQuestion}_2" placeholder="Nhập nội dung đáp 2">
                    </div>
                </div>

                <div class="form-check fs-5 mb-3">
                    <input class="form-check-input border border-2 border-primary" role="button" type="radio" name="question_${currentQuestion}" id="check_${currentQuestion}_3">
                    <!-- text answer -->
                    <div class="mb-3">
                        <input type="text" class="form-control" id="answer_${currentQuestion}_3" placeholder="Nhập nội dung đáp 3">
                    </div>
                </div>

                <div class="form-check fs-5 mb-3">
                    <input class="form-check-input border border-2 border-primary" role="button" type="radio" name="question_${currentQuestion}" id="check_${currentQuestion}_4">
                    <!-- text answer -->
                    <div class="mb-3">
                        <input type="text" class="form-control" id="answer_${currentQuestion}_4" placeholder="Nhập nội dung đáp 4">
                    </div>
                </div>
            </div>
        `
        // console.log(divElement);
        listQuestion.appendChild(divElement)

        const contentQuestion = document.getElementById(`question_content_${currentQuestion}`)
        // console.log(contentQuestion);
        contentQuestion?.focus();
        contentQuestion?.scrollIntoView({behavior: "smooth"});
        
        
        
    },
    handleAdd: function(){
        document.getElementById('btn_add').addEventListener('click', ()=>{
            this.renderQuestion();
        })
    },

    handleSubmit : function (){
        document.getElementById('btn_submit').addEventListener('click',async()=>{
            //1. lấy ra các câu hỏi và trả lời theo nhóm
            const listData = document.querySelectorAll('.question_item');

            //1.2 lấy id của quizz trên URL
            const searchParam = new URLSearchParams(window.location.search);
            let idQuiz;
            if(searchParam.has("id")){
                idQuiz= searchParam.get("id");
            }
            // console.log(listData);
            const data =[]

            for(var i =0; i < listData.length; i++){
                //2.1 lấy nội dung câu hỏi
                const questionContent = document.getElementById(`question_content_${i+1}`)
                //2.2 lấy radio
                const checks = listData[i].querySelectorAll('input[type="radio"]')

                // 2.2 lấy nội dung đáp án
                const answerlist = listData[i].querySelectorAll('input[type="text"]')

                // 3. validate
                const isCheck = this.validate(questionContent,checks,answerlist);
                // console.log(isCheck);
                if(!isCheck){
                    break;
                }
                const item ={
                    questionTiltle: questionContent.value,
                    answers: [],
                    quizId: idQuiz,
                    type: 1,
                    correctAnser:[]
                }

                answerlist.forEach((ans,index)=>{
                    item.answers.push({
                        id: (index+1).toString(),
                        answerTitle: ans.value
                    })
                })

                checks.forEach((check,index)=>{
                    if(check.checked){
                        item.correctAnser.push((index+1).toString())
                    }
                })
                data.push(item)
            }

            console.log(data);
            //thêm mới tất các câu hỏi vào db
            if(data.length == listData.length){
                await addQuestions(data);
                window.location= 'quiz.html';
                alert("Thêm thành công")
            }
            

        })
    },
    validate: function(questionContent,checks,answerlist){
        // validate câu hỏi
        if(!questionContent.value.trim()){
            alert("Cần nhập nội dung câu hỏi");
            questionContent.focus();
            return false;
        }

        // validate đáp án đúng
        // console.log(checks);
        var isCheckRadio = false;
        for(var i =0; i< checks.length; i++){
            // nếu có ít nhất 1 radio được lựa chọn
            if(checks[i].checked){
                // đổi trạng thái isCheckRadio
                isCheckRadio = true;
                break;
            }
        }

        if(!isCheckRadio){
            alert("Cần lựa chọn đáp đúng");
            checks[0].focus();
            return false
        }
        
        //validate đáp án
        var isCheckAnswer = true;
        for(var i =0 ; i< answerlist.length;i++){
            if(!answerlist[i].value.trim()){
                alert("Cần nhập nội dung đáp án");
                answerlist[i].focus();
                isCheckAnswer= false;
                break
            }
        }

        if(!isCheckAnswer){
            return false;
        }
        
        return true;

    },
    start: function(){
        this.renderQuestion();
        this.handleAdd();
        this.handleSubmit();
    }
}

app.start();