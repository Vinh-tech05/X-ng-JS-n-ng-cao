import {getAllQuiz, deleteQuiz,getQuizById,updateQuiz,getQuestionsByIdQuiz} from '../services/api.js';

const app ={
    renderQuizsList: async function () {
        // 1. call api lấy danh sách quiz
            const data = await getAllQuiz();
                // console.log(data);
                
          //2 Hiển thị ra table
                
    
        const listQuiz= data?.map((item,index)=>{
            return`
             <tr>
            <td>${index+1}</td>
            <td>${item.title}</td>
            <td>${item.quantityQuestion}</td>
            <td>${item.time}</td>
            <td>${item.isActive ? 
                `<span class="badge text-bg-success" >Đang Kích Hoạt</span>`
                : 
                `<span class="badge text-bg-danger" >Ẩn</span>`}
            </td>
            <td>${item.description}</td>
            <td><button data-id="${item.id}" class="btn-updateQuiz btn btn-success">Sửa Quiz</button></td>
            <td><button data-id="${item.id}" class="btn-updateQuestion btn btn-secondary">Sửa câu hỏi</button></td>
            <td><button data-id="${item.id}" class="btn-delete btn btn-danger">Xóa</button></td>

          </tr>

            `
          }).join("")
        //   console.log(listQuiz);
          

            const tbodyElement = document.querySelector('tbody');
            tbodyElement.innerHTML = listQuiz;

            this.DeleteQuiz(); 
            this.handleUpdateQuiz();
            this.handleUpdateQuestion();
    },

                    //Xóa
    DeleteQuiz: function () {
        //1 lấy tất cả các nút xóa
        const btnDeletes = document.querySelectorAll('.btn-delete');
        // console.log(btnDeletes);

        //2 Định nghĩa sự kiện nút xóa
        btnDeletes.forEach((item)=>{
            item.addEventListener('click',()=>{
                const id = item.dataset.id;
                // console.log("clickk");
                //3. Xác nhận
                if(window.confirm("Bạn có chắc chắn muốn xóa Quiz này không?")){
                    // console.log(item); 
                    deleteQuiz(id)
                }
            })
        })
        
    },


    //sửa quiz
        handleUpdateQuiz: function() {
            // 1.định nghĩa sự kiện
            const btnUpdateQuiz = document.querySelectorAll('.btn-updateQuiz');
            // console.log(btnUpdateQuiz);
            btnUpdateQuiz.forEach((item=>{
                item.addEventListener('click',async()=>{
                    const id = item.dataset.id;
                    // console.log(id);
                    //2. lấy thông tin theo id
                const quiz = await getQuizById(id) ;
                // console.log(quiz);
                
                document.getElementById('container').innerHTML =`
  <h1>Cập Nhật quiz</h1>
<form id="updateForm">
    <div class="mb-3">
        <label for="title" class="form-label">Tên quiz</label>
        <input type="text" class="form-control" id="title" value="${quiz.title}" required />
    </div>

    <div class="mb-3">
        <label for="isActive" class="form-label">Trạng thái</label>
        <div class="form-check">
            <input
                class="form-check-input"
                type="checkbox"
                id="isActive"
                ${quiz.isActive ? 'checked' : ''}
            />
            <label class="form-check-label" for="isActive">Kích hoạt</label>
        </div>
    </div>

    <div class="mb-3">
        <label for="time" class="form-label">Thời gian</label>
        <input type="number" class="form-control" id="time" value="${quiz.time}" required />
    </div>

    <div class="mb-3">
        <label for="description" class="form-label">Mô tả</label>
        <textarea class="form-control" id="description" rows="3">${quiz.description}</textarea>
    </div>

    <button type="submit" class="btn btn-primary">Cập nhật</button>
                </form>
                         `
                    
     this.handleEditQuiz(id);
                })
            }))
        },


        handleEditQuiz:function(id){
                // 1 Bắt sự kiện submit
        const form = document.getElementById('updateForm')
        .addEventListener("submit",async(e)=>{
        // ngăn chặn hành vi load trang
        e.preventDefault();

        // 2. lấy input
        const inputTitle = document.getElementById('title');
        const inputIsActive = document.getElementById('isActive');
        const inputTime = document.getElementById('time')
        const inputDescription = document.getElementById('description');

        //3 . validate
        if(!inputTitle.value.trim()){
            alert("Cần nhập thông tin tên quiz");
            inputTitle.focus();
            return; // ngăn chặn thực thi các tác vụ tiếp theo
        }

        if(!inputTime.value.trim()){
            alert("Cần nhập thông tin thời gian");
            inputTime.focus();
            return; // ngăn chặn thực thi các tác vụ tiếp theo
        }

        // 4. lấy dữ liệu
        const data = {
            title : inputTitle.value,
            isActive : inputIsActive.checked,
            time: inputTime.value,
            description :inputDescription.value || ""
        }

        // 5.Cập nhật db

        // console.log(data);
         await updateQuiz(id,data);
        alert("Cập nhật thành công");
        
    })     
            },



    //sửa câu hỏi quiz
    handleUpdateQuestion:function() {
        const currentQuestion = document.querySelectorAll('.question_item')?.length + 1 || 1;
        // 1.định nghĩa sự kiện
         const btnUpdateQuestion = document.querySelectorAll('.btn-updateQuestion');
        //  console.log(btnUpdateQuestion);
         btnUpdateQuestion.forEach((item=>{
             item.addEventListener('click',async()=>{
                 const idQuiz = item.dataset.id;
                //  console.log(id);
                 //2. lấy thông tin theo id
             const question = await getQuestionsByIdQuiz(idQuiz) ;
            //  console.log(quiz);
             
             document.getElementById('container').innerHTML =`
<h1>Cập Nhật question</h1>
<form id="updateForm">
 <h4 class="question_number">Câu hỏi: ${currentQuestion}</h4>
            <div class="mb-3">
                <label for="question_${currentQuestion}"  class="form-label">Nội dung câu hỏi</label>
                <textarea class="form-control" id="question_content_${currentQuestion}" value="${question.questionTiltle}" rows="3"></textarea>
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
 <button type="submit" class="btn btn-primary">Cập nhật</button>
     </form>
                      `

             })
         }))
        
        

    },

    
    start:function () {
        this.renderQuizsList();

    }
}
app.start();