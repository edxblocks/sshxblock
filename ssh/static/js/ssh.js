/* Javascript for SshXBlock. */
function SshXBlock(runtime, element) {
    

    
//Regex to check if one or more spaces on start
function checkSpaces(item){return  /^[ ]+/.test(item)}   
//Regex to check if a number
function checkNumber(item){return  /^((22)|([1-9][0-9]{3,}))/.test(item)}           
    /**
     * This function is responsible for printing
     * the output of a command passed to server.
     */

/*
  Function to execute the command
  3 Types of commands
  Normal command like ls
  cd command in order to change directory
  editor commands:words like nano,pico,vi,gedit,edit will fire a UI editor with a modal window in order to edit text
*/     
    function printCommandOutput(result) {
        var res = JSON.parse(result)['response'];
        if( (JSON.parse(result)['type'])==="cd" )
            termObj.set_prompt(res)  ;    
        else if(  (JSON.parse(result)['type'])==="editor" )
        {
            $("#title").html(JSON.parse(result)['title']);
            window.location.href = "#openModal";
            var collided="";
            for(i in res)
                collided+=res[i];
            $("#cat").val(collided) ; 
        }        
        else if(res!="")
        { 
            var collided="";
            for(i in res)
                collided+=res[i];
            termObj.echo(collided);            
        }            
    }

    function done(result) {    
       termObj.echo(result.autho);
       if(result.autho==="Connected")
        termObj.set_prompt(result.prefix);
    }
    
    var selectedHost = null
    var sshCmd = runtime.handlerUrl(element, 'process_command');
    var authorizeUrl = runtime.handlerUrl(element, 'authorize');
    var getHostUrl = runtime.handlerUrl(element, 'getHost');
    var getPortUrl = runtime.handlerUrl(element, 'getPort');
    var getProfileUrl = runtime.handlerUrl(element, 'getProfile');
    var saveTextUrl = runtime.handlerUrl(element, 'saveText');
    var termObj = $('#termDiv').terminal(
                function(command, term) {
                 
                }, {
            prompt: '>',
            name: 'test',
            enabled: true,
            greetings: 'Hello there. This is a terminal emulator!',
            keydown: function(e, term) {
                // keycode 13 --> enter keystroke
                // keycode 9  --> tab / Autocompletition
                if (e.which === 13) {
                    $.ajax({
                        type: "POST",
                        url: sshCmd,
                        data: JSON.stringify({"cmd": term.get_command()}),
                        success: printCommandOutput
                    });
                }
                //else if (e.which === 9)
                //{
                //}
            }
        });
       //Function to make ssh connect with ssh.py  authorize function
       $('#btncon', element).click(function(eventObject) {
           host = $("#hostTxt").val() 
           port = $("#portTxt").val()
           user = $("#usernameTxt").val()
           pass = $("#passwordTxt").val()
           if(!(checkSpaces(host) || host==="" || checkSpaces(port) || port==="" || !checkNumber(port) || port==="" || checkSpaces(user) || user==="" ||checkSpaces(pass) || pass==="") )
            $.ajax({
                type: "POST",
                url: authorizeUrl,
                data: JSON.stringify({"host":host,"port":port, "user": user, "pass": pass}),
                success: done
            });
            else alert("Please fill all fields with valid data!!!")
    });
       
    
    function updateHostList(result)
    {
        $('#data-hosts').empty();
        var hosts = JSON.parse(result)['hosts']
        for (var i in hosts)            
           $('#data-hosts').append("<option value='" + hosts[i] + "'>");      
    }
    
    function updatePortList(result)
    {
        $('#data-ports').empty();
        var port = result.port       
        $('#data-ports').append("<option value='" + port + "'>");  
    }
    
    function updateUserList(result)
    {
        $('#data-users').empty();
        var users = JSON.parse(result)['profiles']
        for (var i in users)            
        {$('#data-users').append("<option value='" + users[i][0] + "'>");
        }        
    }
    
    $('#hostTxt', element).click(function(eventObject) {
           $.ajax({
                type: "POST",
                url: getHostUrl,
                data: JSON.stringify({"null":"null"}),
                success: updateHostList
            });
    });
    
    $('#hostTxt', element).change(function(eventObject) {
        if(selectedHost!=$('#hostTxt').val())
        {
            $('#portTxt').val('')
            $('#usernameTxt').val('')
            $('#passwordTxt').val('')
            selectedHost=$('#hostTxt').val()
        }       
    });
    
    $('#portTxt', element).click(function(eventObject) {
        if(selectedHost!=null && selectedHost!="")
          $.ajax({
                type: "POST",
                url: getPortUrl,
                data: JSON.stringify({"selectedHost":selectedHost}),
                success: updatePortList
            });
    });
     
    $('#usernameTxt', element).click(function(eventObject) {
          if(selectedHost!=null && selectedHost!="")
          $.ajax({
                type: "POST",
                url: getProfileUrl,
                data: JSON.stringify({"selectedHost":selectedHost}),
                success: updateUserList
            });
    });

    
    //4 modal window functions Save / Save as / Cancel buttons ands one button to clear the modal
    $('#save-pushed', element).click(function(eventObject) {
       if($("#title").html()!="" && $("#title").html()!=null)
           $.ajax({
                type: "POST", 
                url: saveTextUrl,
                data: JSON.stringify({"title":$("#title").html(),"textArea":$("#cat").val()}),
                success: editorDone
            });
    });
    
    $('#save-as-pushed', element).click(function(eventObject) {
          if($("#title").html()!="" && $("#title").html()!=null)
            $.ajax({
                type: "POST",
                url: saveTextUrl,
                data: JSON.stringify({"title":$("#new-title").val(),"textArea":$("#cat").val()}),
                success: editorDone
            });            
    });
     
    $('#cancel-pushed', element).click(function(eventObject) {
          window.location.href = "#close";
          $("#title").html("");   
          $("#new-title").val("");   
          $("#cat").val("");
    }); 
    
    $('#Xbutton', element).click(function(eventObject) {
          window.location.href = "#close";
          $("#title").html("");   
          $("#new-title").val("");   
          $("#cat").val("");
    });
    
    function editorDone(result)
    {
     window.location.href = "#close";
     $("#title").html("");   
     $("#new-title").val("");   
     $("#cat").val("");
    }
    
}
